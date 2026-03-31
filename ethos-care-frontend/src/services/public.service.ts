import api from "@/lib/api";
import {
  ContactMessagePayload,
  RequestAidPayload,
  RequestAidResponse,
  SubmissionResponse,
  VerifyMemberResponse,
  VerifyRequestResponse,
  VolunteerApplicationPayload,
} from "@/types/api";

export const publicService = {
  requestAid: async (payload: RequestAidPayload) => {
    const response = await api.post<RequestAidResponse>("/public/request-aid", payload);
    return response.data;
  },

  verifyRequest: async (requestId: string) => {
    const response = await api.get<VerifyRequestResponse>(
      `/public/verify/request/${encodeURIComponent(requestId)}`,
    );
    return response.data;
  },

  verifyMember: async (nationalId: string) => {
    const response = await api.get<VerifyMemberResponse>(
      `/public/verify/member/${encodeURIComponent(nationalId)}`,
    );
    return response.data;
  },

  submitContact: async (payload: ContactMessagePayload) => {
    const response = await api.post<SubmissionResponse>("/public/contact", payload);
    return response.data;
  },

  submitVolunteer: async (payload: VolunteerApplicationPayload) => {
    const response = await api.post<SubmissionResponse>("/public/volunteer", payload);
    return response.data;
  },
};
