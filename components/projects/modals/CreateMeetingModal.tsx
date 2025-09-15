"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

interface MeetingFormProps {
  onClose?: () => void;
}

export default function MeetingForm({ onClose }: MeetingFormProps) {
  const router = useRouter();
  const { userId } = useUser();
  const client = useStreamVideoClient();
  const [callDetails, setCallDetails] = useState<Call>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!client || !userId) {
      throw new Error("Stream client not initialized");
    }
    try {
      const meetingId = crypto.randomUUID();
      const call = client.call("default", meetingId);
      if (!call) {
        throw new Error("Failed to create call");
      }
      await call.getOrCreate({
        data: {
          custom: {
            title: values.title,
            description: values.description,
            scheduledDate: values.date,
            scheduledTime: values.time,
          },
          starts_at: new Date(`${values.date}T${values.time}`).toISOString(),
          members: [{ user_id: userId }],
        },
      });
      setCallDetails(call);
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  }

  // Build meeting link using env base URL or window origin as fallback
  const baseUrl =
    (typeof window !== "undefined" && window.location.origin) ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "";
  const meetingLink = callDetails ? `${baseUrl}/meeting/${callDetails.id}` : "";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      {/* Modal panel */}
      <div className="relative w-full max-w-xl rounded-lg border bg-white shadow-xl p-6 animate-in fade-in zoom-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-sm"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Schedule a Meeting</h3>
          <p className="text-xs text-muted-foreground">
            Fill details below to create a meeting
          </p>
        </div>
        <div className="max-w-2xl mx-auto w-full">
          {callDetails ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4 text-orange-800">
                Meeting Created!
              </h2>
              <p className="mb-4">
                Your meeting has been scheduled successfully.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => {
                    if (meetingLink) {
                      navigator.clipboard.writeText(meetingLink);
                      toast.success("Link copied!");
                    }
                  }}
                  className="flex items-center gap-2 text-orange-600 cursor-pointer"
                >
                  Copy Meeting Link
                </Button>
                <Button
                  onClick={() => router.push(`/meeting/${callDetails?.id}`)}
                  className="text-orange-600 cursor-pointer"
                >
                  Start Meeting
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 max-h-[60vh] overflow-y-auto pr-6 pl-6"
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Meeting Title
                </label>
                <Input
                  placeholder="Enter meeting title"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Enter meeting description"
                  className="resize-none"
                  {...form.register("description")}
                />
                <p className="text-xs text-muted-foreground">
                  Brief description about the meeting agenda
                </p>
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Date</label>
                  <Input type="date" {...form.register("date")} />
                  {form.formState.errors.date && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.date.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Time</label>
                  <Input type="time" {...form.register("time")} />
                  {form.formState.errors.time && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.time.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                {onClose && (
                  <Button variant="outline" type="button" onClick={onClose}>
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  className="text-orange-600 cursor-pointer"
                >
                  Schedule Meeting
                </Button>
              </div>
            </form>
          )}
        </div>
        {/* end inner content wrapper */}
      </div>
      {/* end modal panel */}
    </div> /* end overlay */
  );
}

export const CreateMeetingModal = MeetingForm;
