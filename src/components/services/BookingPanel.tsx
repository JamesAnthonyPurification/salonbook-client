"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, CalendarPlus, CheckCircle2, Clock, Info } from "lucide-react";
import { toast } from "sonner";
import { api, getErrorMessage, getFieldErrors, publicApi } from "@/lib/api";
import { TIME_SLOTS } from "@/lib/constants";
import { formatApptDate, formatPrice, todayLocal } from "@/lib/format";
import { Spinner } from "@/components/ui/Loader";
import type { Service } from "@/lib/types";

/** Slots earlier than "now" are not bookable for today's date */
function isPastSlot(date: string, slot: string) {
  if (date !== todayLocal()) return false;
  const [time, meridiem] = slot.split(" ");
  let [h] = time!.split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h! += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return h! <= new Date().getHours();
}

export default function BookingPanel({ service, role }: { service: Service; role: string }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [message, setMessage] = useState("");
  const [booked, setBooked] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<{ date: string; slot: string } | null>(null);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setSlotsLoading(true);
    publicApi
      .get<{ data: { booked: string[] } }>("/appointments/booked-slots", { params: { serviceId: service._id, date } })
      .then((res) => !cancelled && setBooked(res.data.data.booked))
      .catch(() => !cancelled && setBooked([]))
      .finally(() => !cancelled && setSlotsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [date, service._id, success]);

  if (role === "admin") {
    return (
      <div className="flex gap-3 rounded-2xl bg-stone-100 p-4 text-sm text-stone-600">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-stone-500" />
        <p>
          You are signed in as an <strong>admin</strong>. Admin accounts can&apos;t submit customer appointment requests.
          Manage this service from the{" "}
          <Link href="/dashboard/admin/services" className="font-semibold text-brand-700 underline">admin dashboard</Link>.
        </p>
      </div>
    );
  }

  if (service.status !== "active") {
    return (
      <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        <p>This service is currently unavailable for booking. Please explore our other services.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex gap-3">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-900">Appointment request sent!</p>
            <p className="mt-1 text-sm text-emerald-800">
              {formatApptDate(success.date)} at {success.slot}. Status: <strong>Pending</strong>. We&apos;ll confirm it
              shortly — you can pay once it&apos;s confirmed.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/dashboard/customer/appointments" className="btn-primary btn-sm">View my appointments</Link>
          <button
            className="btn-outline btn-sm"
            onClick={() => {
              setSuccess(null);
              setSlot("");
              setMessage("");
            }}
          >
            Book another slot
          </button>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <button className="btn-primary w-full py-3.5 text-base sm:w-auto sm:px-8" onClick={() => setOpen(true)}>
        <CalendarPlus className="h-5 w-5" /> Book Appointment
      </button>
    );
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!date) e.appointmentDate = "Please choose a date";
    else if (date < todayLocal()) e.appointmentDate = "Date cannot be in the past";
    if (!slot) e.timeSlot = "Please choose a time slot";
    if (message.length > 500) e.message = "Message must be under 500 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await api.post<{ message: string }>("/appointments", {
        serviceId: service._id,
        appointmentDate: date,
        timeSlot: slot,
        message: message.trim(),
      });
      toast.success(res.data.message || "Appointment request submitted");
      setSuccess({ date, slot });
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, "Could not submit your appointment request"));
      // refresh booked slots in case of a conflict
      if (date) {
        publicApi
          .get<{ data: { booked: string[] } }>("/appointments/booked-slots", { params: { serviceId: service._id, date } })
          .then((r) => setBooked(r.data.data.booked))
          .catch(() => {});
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-5 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Request an appointment</h2>
        <button type="button" className="text-sm text-stone-500 hover:text-stone-800" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>

      <div>
        <label htmlFor="date" className="label inline-flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-brand-600" /> Appointment date
        </label>
        <input
          id="date"
          type="date"
          min={todayLocal()}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSlot("");
          }}
          className={`input ${errors.appointmentDate ? "input-error" : ""}`}
        />
        {errors.appointmentDate && <p className="field-error">{errors.appointmentDate}</p>}
      </div>

      <div>
        <span className="label inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-brand-600" /> Available time slot
          {slotsLoading && <Spinner className="h-3.5 w-3.5 text-stone-400" />}
        </span>
        {!date ? (
          <p className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-500">Choose a date to see available slots.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {TIME_SLOTS.map((s) => {
              const taken = booked.includes(s);
              const past = isPastSlot(date, s);
              const disabled = taken || past || slotsLoading;
              return (
                <button
                  type="button"
                  key={s}
                  disabled={disabled}
                  onClick={() => setSlot(s)}
                  title={taken ? "Already booked" : past ? "This time has passed" : undefined}
                  className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                    slot === s
                      ? "border-brand-700 bg-brand-700 text-white"
                      : disabled
                        ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 line-through"
                        : "border-stone-200 bg-white text-stone-700 hover:border-brand-400"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
        {errors.timeSlot && <p className="field-error">{errors.timeSlot}</p>}
      </div>

      <div>
        <label htmlFor="message" className="label">Additional message <span className="text-stone-400">(optional)</span></label>
        <textarea
          id="message"
          rows={3}
          maxLength={500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Allergies, preferences, or anything we should know…"
          className={`input resize-none ${errors.message ? "input-error" : ""}`}
        />
        <p className="mt-1 text-right text-xs text-stone-400">{message.length}/500</p>
      </div>

      <div className="flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-500">
          Total: <span className="text-lg font-semibold text-stone-900">{formatPrice(service.price)}</span>
          <span className="block text-xs">Pay online after the salon confirms.</span>
        </p>
        <button type="submit" className="btn-primary px-7 py-3" disabled={submitting}>
          {submitting && <Spinner />} {submitting ? "Sending request…" : "Submit Request"}
        </button>
      </div>
    </form>
  );
}
