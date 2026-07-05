-- CreateIndex: Case
CREATE INDEX "Case_lifecycleStatus_idx" ON "Case"("lifecycleStatus");
CREATE INDEX "Case_priority_lifecycleStatus_idx" ON "Case"("priority", "lifecycleStatus");
CREATE INDEX "Case_completenessStatus_idx" ON "Case"("completenessStatus");
CREATE INDEX "Case_familyId_idx" ON "Case"("familyId");
CREATE INDEX "Case_assignedToId_idx" ON "Case"("assignedToId");
CREATE INDEX "Case_operationId_idx" ON "Case"("operationId");
CREATE INDEX "Case_createdAt_idx" ON "Case"("createdAt");

-- CreateIndex: CaseHistory
CREATE INDEX "CaseHistory_caseId_performedAt_idx" ON "CaseHistory"("caseId", "performedAt");
CREATE INDEX "CaseHistory_performedById_idx" ON "CaseHistory"("performedById");

-- CreateIndex: Family
CREATE INDEX "Family_status_idx" ON "Family"("status");

-- CreateIndex: FamilyMember
CREATE INDEX "FamilyMember_familyId_idx" ON "FamilyMember"("familyId");

-- CreateIndex: Volunteer
CREATE INDEX "Volunteer_status_idx" ON "Volunteer"("status");
CREATE INDEX "Volunteer_nationalId_idx" ON "Volunteer"("nationalId");
CREATE INDEX "Volunteer_phone_idx" ON "Volunteer"("phone");

-- CreateIndex: VolunteerAssignment
CREATE INDEX "VolunteerAssignment_operationId_idx" ON "VolunteerAssignment"("operationId");

-- CreateIndex: News
CREATE INDEX "News_authorId_idx" ON "News"("authorId");
CREATE INDEX "News_published_date_idx" ON "News"("published", "date");
