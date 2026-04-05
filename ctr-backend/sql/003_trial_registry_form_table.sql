-- Dedicated relational table for Clinical Trial Registry Form
-- Source-of-truth payload still lives in trials.data for API compatibility.
-- This table is synced from trials.data via trigger and backfilled for existing rows.

CREATE TABLE IF NOT EXISTS trial_registry_forms (
  trial_id UUID PRIMARY KEY REFERENCES trials(id) ON DELETE CASCADE,

  -- Core identifiers
  title TEXT NOT NULL DEFAULT '',
  brief_summary TEXT NOT NULL DEFAULT '',
  trial_design TEXT NOT NULL DEFAULT '',
  trial_phase TEXT NOT NULL DEFAULT '',
  diseases TEXT NOT NULL DEFAULT '',
  purpose TEXT NOT NULL DEFAULT '',

  -- Dates and recruitment
  anticipated_start_date TEXT NOT NULL DEFAULT '',
  actual_start_date TEXT NOT NULL DEFAULT '',
  last_follow_up_date TEXT NOT NULL DEFAULT '',
  completion_date TEXT NOT NULL DEFAULT '',
  target_participants TEXT NOT NULL DEFAULT '',
  project_area TEXT NOT NULL DEFAULT '',
  recruitment_status TEXT NOT NULL DEFAULT '',
  publication_url TEXT NOT NULL DEFAULT '',

  -- Study design
  intervention_assignment TEXT NOT NULL DEFAULT '',
  allocation TEXT NOT NULL DEFAULT '',
  allocation_concealment_description TEXT NOT NULL DEFAULT '',
  allocation_sequence_generation TEXT NOT NULL DEFAULT '',
  masking_enabled BOOLEAN NOT NULL DEFAULT false,
  masking_roles JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Interventions
  intervention_type TEXT NOT NULL DEFAULT '',
  intervention_name TEXT NOT NULL DEFAULT '',
  intervention_dose TEXT NOT NULL DEFAULT '',
  intervention_duration TEXT NOT NULL DEFAULT '',
  intervention_description TEXT NOT NULL DEFAULT '',
  intervention_group_size TEXT NOT NULL DEFAULT '',

  -- Eligibility
  inclusion_criteria TEXT NOT NULL DEFAULT '',
  exclusion_criteria TEXT NOT NULL DEFAULT '',
  min_age TEXT NOT NULL DEFAULT '',
  max_age TEXT NOT NULL DEFAULT '',
  sex TEXT NOT NULL DEFAULT '',

  -- Outcome
  outcome_type TEXT NOT NULL DEFAULT '',
  outcome_description TEXT NOT NULL DEFAULT '',
  outcome_timepoints TEXT NOT NULL DEFAULT '',

  -- Recruitment centre
  recruitment_centre_name TEXT NOT NULL DEFAULT '',
  recruitment_centre_street TEXT NOT NULL DEFAULT '',
  recruitment_centre_city TEXT NOT NULL DEFAULT '',

  -- Ethics
  has_ethics_approval TEXT NOT NULL DEFAULT '',
  ethics_approval_date TEXT NOT NULL DEFAULT '',
  ethics_committee_name TEXT NOT NULL DEFAULT '',
  ethics_street TEXT NOT NULL DEFAULT '',
  ethics_phone TEXT NOT NULL DEFAULT '',
  ethics_email TEXT NOT NULL DEFAULT '',
  ethics_planned_submission_date TEXT NOT NULL DEFAULT '',
  ethics_document_name TEXT NOT NULL DEFAULT '',

  -- Funding
  funding_source_name TEXT NOT NULL DEFAULT '',
  funding_source_type TEXT NOT NULL DEFAULT '',

  -- Sponsors
  sponsor_level TEXT NOT NULL DEFAULT '',
  sponsor_name TEXT NOT NULL DEFAULT '',
  sponsor_city TEXT NOT NULL DEFAULT '',
  sponsor_country TEXT NOT NULL DEFAULT '',

  -- Collaborators
  has_collaborator TEXT NOT NULL DEFAULT '',
  collaborator_name TEXT NOT NULL DEFAULT '',
  collaborator_country TEXT NOT NULL DEFAULT '',

  -- Contact people
  contact_role TEXT NOT NULL DEFAULT '',
  contact_first_name TEXT NOT NULL DEFAULT '',
  contact_last_name TEXT NOT NULL DEFAULT '',
  contact_title TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  contact_phone TEXT NOT NULL DEFAULT '',
  contact_city TEXT NOT NULL DEFAULT '',
  contact_position TEXT NOT NULL DEFAULT '',
  contact_institution TEXT NOT NULL DEFAULT '',

  -- IPD
  ipd_description TEXT NOT NULL DEFAULT '',
  ipd_additional_docs_name TEXT NOT NULL DEFAULT '',

  -- Legacy compatibility fields seen in old UI snapshots
  trial_title TEXT NOT NULL DEFAULT '',
  principal_investigator TEXT NOT NULL DEFAULT '',
  institution TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trial_registry_forms_title ON trial_registry_forms(title);
CREATE INDEX IF NOT EXISTS idx_trial_registry_forms_contact_email ON trial_registry_forms(contact_email);
CREATE INDEX IF NOT EXISTS idx_trial_registry_forms_city ON trial_registry_forms(recruitment_centre_city);

CREATE OR REPLACE FUNCTION sync_trial_registry_form_from_trials()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO trial_registry_forms (
    trial_id,
    title, brief_summary, trial_design, trial_phase, diseases, purpose,
    anticipated_start_date, actual_start_date, last_follow_up_date, completion_date,
    target_participants, project_area, recruitment_status, publication_url,
    intervention_assignment, allocation, allocation_concealment_description, allocation_sequence_generation,
    masking_enabled, masking_roles,
    intervention_type, intervention_name, intervention_dose, intervention_duration, intervention_description, intervention_group_size,
    inclusion_criteria, exclusion_criteria, min_age, max_age, sex,
    outcome_type, outcome_description, outcome_timepoints,
    recruitment_centre_name, recruitment_centre_street, recruitment_centre_city,
    has_ethics_approval, ethics_approval_date, ethics_committee_name, ethics_street, ethics_phone, ethics_email,
    ethics_planned_submission_date, ethics_document_name,
    funding_source_name, funding_source_type,
    sponsor_level, sponsor_name, sponsor_city, sponsor_country,
    has_collaborator, collaborator_name, collaborator_country,
    contact_role, contact_first_name, contact_last_name, contact_title, contact_email, contact_phone,
    contact_city, contact_position, contact_institution,
    ipd_description, ipd_additional_docs_name,
    trial_title, principal_investigator, institution,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.data->>'title', ''),
    COALESCE(NEW.data->>'briefSummary', ''),
    COALESCE(NEW.data->>'trialDesign', ''),
    COALESCE(NEW.data->>'trialPhase', ''),
    COALESCE(NEW.data->>'diseases', ''),
    COALESCE(NEW.data->>'purpose', ''),
    COALESCE(NEW.data->>'anticipatedStartDate', ''),
    COALESCE(NEW.data->>'actualStartDate', ''),
    COALESCE(NEW.data->>'lastFollowUpDate', ''),
    COALESCE(NEW.data->>'completionDate', ''),
    COALESCE(NEW.data->>'targetParticipants', ''),
    COALESCE(NEW.data->>'projectArea', ''),
    COALESCE(NEW.data->>'recruitmentStatus', ''),
    COALESCE(NEW.data->>'publicationUrl', ''),
    COALESCE(NEW.data->>'interventionAssignment', ''),
    COALESCE(NEW.data->>'allocation', ''),
    COALESCE(NEW.data->>'allocationConcealmentDescription', ''),
    COALESCE(NEW.data->>'allocationSequenceGeneration', ''),
    COALESCE((NEW.data->>'maskingEnabled')::boolean, false),
    CASE
      WHEN jsonb_typeof(NEW.data->'maskingRoles') = 'array' THEN NEW.data->'maskingRoles'
      ELSE '[]'::jsonb
    END,
    COALESCE(NEW.data->>'interventionType', ''),
    COALESCE(NEW.data->>'interventionName', ''),
    COALESCE(NEW.data->>'interventionDose', ''),
    COALESCE(NEW.data->>'interventionDuration', ''),
    COALESCE(NEW.data->>'interventionDescription', ''),
    COALESCE(NEW.data->>'interventionGroupSize', ''),
    COALESCE(NEW.data->>'inclusionCriteria', ''),
    COALESCE(NEW.data->>'exclusionCriteria', ''),
    COALESCE(NEW.data->>'minAge', ''),
    COALESCE(NEW.data->>'maxAge', ''),
    COALESCE(NEW.data->>'sex', ''),
    COALESCE(NEW.data->>'outcomeType', ''),
    COALESCE(NEW.data->>'outcomeDescription', ''),
    COALESCE(NEW.data->>'outcomeTimepoints', ''),
    COALESCE(NEW.data->>'recruitmentCentreName', ''),
    COALESCE(NEW.data->>'recruitmentCentreStreet', ''),
    COALESCE(NEW.data->>'recruitmentCentreCity', ''),
    COALESCE(NEW.data->>'hasEthicsApproval', ''),
    COALESCE(NEW.data->>'ethicsApprovalDate', ''),
    COALESCE(NEW.data->>'ethicsCommitteeName', ''),
    COALESCE(NEW.data->>'ethicsStreet', ''),
    COALESCE(NEW.data->>'ethicsPhone', ''),
    COALESCE(NEW.data->>'ethicsEmail', ''),
    COALESCE(NEW.data->>'ethicsPlannedSubmissionDate', ''),
    COALESCE(NEW.data->>'ethicsDocumentName', ''),
    COALESCE(NEW.data->>'fundingSourceName', ''),
    COALESCE(NEW.data->>'fundingSourceType', ''),
    COALESCE(NEW.data->>'sponsorLevel', ''),
    COALESCE(NEW.data->>'sponsorName', ''),
    COALESCE(NEW.data->>'sponsorCity', ''),
    COALESCE(NEW.data->>'sponsorCountry', ''),
    COALESCE(NEW.data->>'hasCollaborator', ''),
    COALESCE(NEW.data->>'collaboratorName', ''),
    COALESCE(NEW.data->>'collaboratorCountry', ''),
    COALESCE(NEW.data->>'contactRole', ''),
    COALESCE(NEW.data->>'contactFirstName', ''),
    COALESCE(NEW.data->>'contactLastName', ''),
    COALESCE(NEW.data->>'contactTitle', ''),
    COALESCE(NEW.data->>'contactEmail', ''),
    COALESCE(NEW.data->>'contactPhone', ''),
    COALESCE(NEW.data->>'contactCity', ''),
    COALESCE(NEW.data->>'contactPosition', ''),
    COALESCE(NEW.data->>'contactInstitution', ''),
    COALESCE(NEW.data->>'ipdDescription', ''),
    COALESCE(NEW.data->>'ipdAdditionalDocsName', ''),
    COALESCE(NEW.data->>'trialTitle', ''),
    COALESCE(NEW.data->>'principalInvestigator', ''),
    COALESCE(NEW.data->>'institution', ''),
    now()
  )
  ON CONFLICT (trial_id)
  DO UPDATE SET
    title = EXCLUDED.title,
    brief_summary = EXCLUDED.brief_summary,
    trial_design = EXCLUDED.trial_design,
    trial_phase = EXCLUDED.trial_phase,
    diseases = EXCLUDED.diseases,
    purpose = EXCLUDED.purpose,
    anticipated_start_date = EXCLUDED.anticipated_start_date,
    actual_start_date = EXCLUDED.actual_start_date,
    last_follow_up_date = EXCLUDED.last_follow_up_date,
    completion_date = EXCLUDED.completion_date,
    target_participants = EXCLUDED.target_participants,
    project_area = EXCLUDED.project_area,
    recruitment_status = EXCLUDED.recruitment_status,
    publication_url = EXCLUDED.publication_url,
    intervention_assignment = EXCLUDED.intervention_assignment,
    allocation = EXCLUDED.allocation,
    allocation_concealment_description = EXCLUDED.allocation_concealment_description,
    allocation_sequence_generation = EXCLUDED.allocation_sequence_generation,
    masking_enabled = EXCLUDED.masking_enabled,
    masking_roles = EXCLUDED.masking_roles,
    intervention_type = EXCLUDED.intervention_type,
    intervention_name = EXCLUDED.intervention_name,
    intervention_dose = EXCLUDED.intervention_dose,
    intervention_duration = EXCLUDED.intervention_duration,
    intervention_description = EXCLUDED.intervention_description,
    intervention_group_size = EXCLUDED.intervention_group_size,
    inclusion_criteria = EXCLUDED.inclusion_criteria,
    exclusion_criteria = EXCLUDED.exclusion_criteria,
    min_age = EXCLUDED.min_age,
    max_age = EXCLUDED.max_age,
    sex = EXCLUDED.sex,
    outcome_type = EXCLUDED.outcome_type,
    outcome_description = EXCLUDED.outcome_description,
    outcome_timepoints = EXCLUDED.outcome_timepoints,
    recruitment_centre_name = EXCLUDED.recruitment_centre_name,
    recruitment_centre_street = EXCLUDED.recruitment_centre_street,
    recruitment_centre_city = EXCLUDED.recruitment_centre_city,
    has_ethics_approval = EXCLUDED.has_ethics_approval,
    ethics_approval_date = EXCLUDED.ethics_approval_date,
    ethics_committee_name = EXCLUDED.ethics_committee_name,
    ethics_street = EXCLUDED.ethics_street,
    ethics_phone = EXCLUDED.ethics_phone,
    ethics_email = EXCLUDED.ethics_email,
    ethics_planned_submission_date = EXCLUDED.ethics_planned_submission_date,
    ethics_document_name = EXCLUDED.ethics_document_name,
    funding_source_name = EXCLUDED.funding_source_name,
    funding_source_type = EXCLUDED.funding_source_type,
    sponsor_level = EXCLUDED.sponsor_level,
    sponsor_name = EXCLUDED.sponsor_name,
    sponsor_city = EXCLUDED.sponsor_city,
    sponsor_country = EXCLUDED.sponsor_country,
    has_collaborator = EXCLUDED.has_collaborator,
    collaborator_name = EXCLUDED.collaborator_name,
    collaborator_country = EXCLUDED.collaborator_country,
    contact_role = EXCLUDED.contact_role,
    contact_first_name = EXCLUDED.contact_first_name,
    contact_last_name = EXCLUDED.contact_last_name,
    contact_title = EXCLUDED.contact_title,
    contact_email = EXCLUDED.contact_email,
    contact_phone = EXCLUDED.contact_phone,
    contact_city = EXCLUDED.contact_city,
    contact_position = EXCLUDED.contact_position,
    contact_institution = EXCLUDED.contact_institution,
    ipd_description = EXCLUDED.ipd_description,
    ipd_additional_docs_name = EXCLUDED.ipd_additional_docs_name,
    trial_title = EXCLUDED.trial_title,
    principal_investigator = EXCLUDED.principal_investigator,
    institution = EXCLUDED.institution,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_trial_registry_form_from_trials ON trials;

CREATE TRIGGER trg_sync_trial_registry_form_from_trials
AFTER INSERT OR UPDATE OF data ON trials
FOR EACH ROW
EXECUTE FUNCTION sync_trial_registry_form_from_trials();

-- Backfill existing trials
INSERT INTO trial_registry_forms (trial_id)
SELECT t.id
FROM trials t
LEFT JOIN trial_registry_forms f ON f.trial_id = t.id
WHERE f.trial_id IS NULL;

-- Force trigger population for all existing rows
UPDATE trials SET data = data;
