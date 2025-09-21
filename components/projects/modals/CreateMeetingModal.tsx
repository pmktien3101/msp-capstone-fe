"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useUser } from "@/hooks/useUser";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Member, Participant } from "@/types";
import { mockParticipants } from "@/constants/mockData";

const formSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  description: z.string().min(1, "Vui lòng nhập mô tả"),
  date: z.string().min(1, "Vui lòng chọn ngày"),
  time: z.string().min(1, "Vui lòng chọn giờ"),
  participants: z
    .array(z.string())
    .min(1, "Vui lòng chọn ít nhất 1 người tham gia"),
});

interface MeetingFormProps {
  onClose?: () => void;
  onCreated?: (call: Call) => void;
  projectId?: string;
}

export default function MeetingForm({
  onClose,
  onCreated,
  projectId,
}: MeetingFormProps) {
  const { userId } = useUser();
  const client = useStreamVideoClient();
  const [callDetails, setCallDetails] = useState<Call>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      participants: [],
    },
  });

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setParticipants(mockParticipants);
      } catch (error) {
        console.error("Error fetching participants:", error);
        toast.error("Không thể tải danh sách người tham gia");
      }
    };

    fetchParticipants();
  }, [projectId]);

  const handleParticipantChange = (participantId: string) => {
    setSelectedParticipants((prev) => {
      if (prev.includes(participantId)) {
        return prev.filter((id) => id !== participantId);
      }
      return [...prev, participantId];
    });
  };
  useEffect(() => {
    form.setValue("participants", selectedParticipants, {
      shouldValidate: true,
    });
  }, [selectedParticipants, form]);

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

      // Include all participants including the creator
      const allParticipants = [...new Set([userId, ...selectedParticipants])];

      await call.getOrCreate({
        data: {
          custom: {
            title: values.title,
            description: values.description,
            scheduledDate: values.date,
            scheduledTime: values.time,
            projectId: projectId,
            participants: allParticipants, // Add participants to custom data
          },
          starts_at: new Date(`${values.date}T${values.time}`).toISOString(),
          members: allParticipants.map((id) => ({ user_id: id })),
        },
      });
      setCallDetails(call);
      onCreated?.(call);
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("Không thể tạo cuộc họp");
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
          <h3 className="text-lg font-semibold">Tạo cuộc họp mới</h3>
          <p className="text-xs text-muted-foreground">
            Vui lòng điền thông tin để lên lịch cuộc họp cho dự án
          </p>
        </div>
        <div className="max-w-2xl mx-auto w-full">
          {callDetails ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4 text-orange-800">
                Đã tạo cuộc họp!
              </h2>
              <p className="mb-4">Cuộc họp đã được lên lịch thành công.</p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => {
                    if (meetingLink) {
                      navigator.clipboard.writeText(meetingLink);
                      toast.success("Đã sao chép link!");
                    }
                  }}
                  className="flex items-center gap-2 bg-orange-500 text-white cursor-pointer"
                >
                  Sao chép link cuộc họp
                </Button>
                <Button
                  onClick={() =>
                    window.open(`/meeting/${callDetails?.id}`, "_blank")
                  }
                  className="bg-orange-500 text-white cursor-pointer"
                >
                  Vào phòng họp
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
                  Tiêu đề cuộc họp
                </label>
                <Input
                  placeholder="Nhập tiêu đề cuộc họp"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Mô tả</label>
                <Textarea
                  placeholder="Nhập mô tả nội dung cuộc họp"
                  className="resize-none"
                  {...form.register("description")}
                />
                <p className="text-xs text-muted-foreground">
                  Mô tả ngắn về nội dung, mục tiêu cuộc họp
                </p>
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Ngày họp</label>
                  <Input type="date" {...form.register("date")} />
                  {form.formState.errors.date && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.date.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Giờ họp</label>
                  <Input type="time" step="60" {...form.register("time")} />
                  {form.formState.errors.time && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.time.message}
                    </p>
                  )}
                </div>
              </div>
              {/* Thêm vào trong form, trước các nút action */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Người tham gia
                </label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center space-x-2 py-1"
                    >
                      <input
                        type="checkbox"
                        id={`participant-${participant.id}`}
                        checked={selectedParticipants.includes(participant.id)}
                        onChange={() => handleParticipantChange(participant.id)}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <label
                        htmlFor={`participant-${participant.id}`}
                        className="text-sm text-gray-700"
                      >
                        ({participant.email}) - {participant.role}
                      </label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.participants && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.participants.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-4">
                {onClose && (
                  <Button variant="outline" type="button" onClick={onClose}>
                    Hủy
                  </Button>
                )}
                <Button
                  type="submit"
                  className="bg-orange-500 text-white cursor-pointer"
                >
                  Tạo cuộc họp
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
