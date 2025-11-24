"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { Participant } from "@/types";
import { projectService } from "@/services/projectService";
import { milestoneService } from "@/services/milestoneService";
import { meetingService } from "@/services/meetingService";
import { MeetingItem } from "@/types/meeting";
import { Call } from "@stream-io/video-react-sdk";

interface UpdateMeetingModalProps {
  meeting: MeetingItem;
  onClose: () => void;
  onUpdated?: () => void;
  requireProjectSelection?: boolean;
  call?: Call; // Thêm dòng này
}

interface ProjectMemberResponse {
  id: string;
  projectId: string;
  userId: string;
  member: {
    id: string;
    userName: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    avatarUrl: string | null;
    role: string;
    createdAt: string;
  };
  joinedAt: string;
  leftAt: string | null;
}

interface Milestone {
  id: string;
  name: string;
  projectId: string;
}

export const UpdateMeetingModal = ({
  meeting,
  onClose,
  onUpdated,
  requireProjectSelection = false,
  call,
}: UpdateMeetingModalProps) => {
  const initialData = {
    title: meeting?.title || "",
    description: meeting?.description || "",
    milestoneId: meeting?.milestoneId || "",
    participants: meeting?.attendees || [],
    dateTime: meeting?.startTime ? new Date(meeting.startTime) : null,
    projectId: meeting?.projectId || "",
  };

  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);
  const [milestoneId, setMilestoneId] = useState(initialData.milestoneId);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    initialData.participants.map((p) => p.id)
  );
  const [dateTime, setDateTime] = useState<Date | null>(initialData.dateTime);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialData.projectId
  );
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);

  // Convert API response to Participant[]
  const convertToParticipants = (
    members: ProjectMemberResponse[]
  ): Participant[] => {
    return members
      .filter((member) => member.member.role !== "ProjectManager")
      .map((member) => ({
        id: member.member.id,
        role: member.member.role,
        image: member.member.avatarUrl || "",
        email: member.member.email,
        name: member.member.fullName,
      }));
  };

  const convertToMilestones = (milestones: any[]): Milestone[] => {
    return milestones.map((milestone) => ({
      id: milestone.id,
      name: milestone.name,
      projectId: milestone.projectId,
    }));
  };

  useEffect(() => {
    const loadParticipantsAndMilestones = async () => {
      if (!selectedProjectId) {
        setParticipants([]);
        setMilestones([]);
        return;
      }
      setIsLoadingParticipants(true);
      setIsLoadingMilestones(true);

      try {
        const projectMembersResult = await projectService.getProjectMembers(
          selectedProjectId
        );
        if (projectMembersResult.success && projectMembersResult.data) {
          setParticipants(
            convertToParticipants(
              projectMembersResult.data as unknown as ProjectMemberResponse[]
            )
          );
        } else {
          setParticipants([]);
        }
      } catch (error: any) {
        toast.error("Unable to load project members");
        setParticipants([]);
      } finally {
        setIsLoadingParticipants(false);
      }

      try {
        const milestonesResult =
          await milestoneService.getMilestonesByProjectId(selectedProjectId);
        if (milestonesResult.success && milestonesResult.data) {
          setMilestones(convertToMilestones(milestonesResult.data));
        } else {
          setMilestones([]);
        }
      } catch (error: any) {
        setMilestones([]);
      } finally {
        setIsLoadingMilestones(false);
      }
    };

    loadParticipantsAndMilestones();
  }, [selectedProjectId]);

  const handleParticipantChange = (id: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setMilestoneId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!title.trim()) throw new Error("Title cannot be empty");
      if (dateTime && dateTime.getTime() < Date.now() - 60_000)
        throw new Error("Start time must be in the future");
      if (selectedParticipants.length === 0)
        throw new Error("Please select at least 1 participant");

      // Update meeting in database
      const meetingId = meeting.id;
      const dbResult = await meetingService.updateMeeting({
        meetingId,
        title: title.trim(),
        description: description.trim(),
        milestoneId: milestoneId || null,
        projectId: requireProjectSelection
          ? selectedProjectId
          : meeting.projectId,
        startTime: dateTime?.toISOString(),
        attendeeIds: selectedParticipants,
      });

      if (!dbResult.success) {
        throw new Error(
          dbResult.error || "Failed to update meeting in database"
        );
      }
      // 2. Update meeting in Stream call
      await call?.update({
        custom: {
          title: title.trim(),
          description: description.trim(),
          participants: selectedParticipants,
          milestoneId: milestoneId || null,
          projectId: requireProjectSelection
            ? selectedProjectId
            : call?.state?.custom?.projectId,
        },
        starts_at: dateTime?.toISOString(),
      });

      await call?.updateCallMembers({
        update_members: selectedParticipants.map((id) => ({
          user_id: id,
          role: "call_member",
        })),
      });
      toast.success("Meeting updated successfully");
      onUpdated?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Update failed");
      toast.error(err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl rounded-lg border bg-white shadow-xl p-6 animate-in fade-in zoom-in">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
        >
          <div className="space-y-1">
            <label className="block text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium">
              Start Time
            </label>
            <DatePicker
              selected={dateTime}
              onChange={(date) => setDateTime(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={30}
              dateFormat="dd/MM/yyyy HH:mm"
              className="w-full border rounded-md p-2"
            />
          </div>
          {requireProjectSelection && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2"
                required
              >
                <option value="">-- Select project --</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Milestone (optional)
            </label>
            {isLoadingMilestones ? (
              <div className="text-sm text-gray-500">
                Loading milestones...
              </div>
            ) : (
              <select
                value={milestoneId}
                onChange={(e) => setMilestoneId(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2"
                disabled={requireProjectSelection && !selectedProjectId}
              >
                <option value="">-- Select milestone --</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Participants</label>
            {isLoadingParticipants ? (
              <div className="text-sm text-gray-500">
                Loading members...
              </div>
            ) : participants.length === 0 ? (
              <div className="text-sm text-gray-500">
                No members in the project
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(p.id)}
                      onChange={() => handleParticipantChange(p.id)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <label className="text-sm text-gray-700">
                      {p.email} - {p.role}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
