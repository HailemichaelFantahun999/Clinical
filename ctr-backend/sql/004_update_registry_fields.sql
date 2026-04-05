-- 004_update_registry_fields.sql
-- Update trial_registry_forms table and sync trigger for 13-section form

ALTER TABLE trial_registry_forms
  -- Section 1: Trial Details additionals
  ADD COLUMN IF NOT EXISTS acronym TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS final_participants TEXT NOT NULL DEFAULT '',
  
  -- Section 2: Secondary Identifiers
  ADD COLUMN IF NOT EXISTS has_secondary_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS secondary_ids TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS secondary_id_issuing_authority TEXT NOT NULL DEFAULT '',

  -- Section 3: Study Design updates
  ADD COLUMN IF NOT EXISTS allocation_concealment TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS masking_type TEXT NOT NULL DEFAULT '',
  
  -- Multiple entries sections (stored as JSONB for simplicity in this flattened table if needed, 
  -- but we'll try to keep some primary ones if they make sense. 
  -- Actually, "Multiple entries" sections are best kept in the JSONB 'data' for the most part,
  -- but for searchability/registry display we might want the primary one or just store the array.)
  ADD COLUMN IF NOT EXISTS interventions JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recruitment_centres JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ethics_approvals JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS funding_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sponsors JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS collaborators JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS contact_persons JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Section 5: Eligibility additions
  ADD COLUMN IF NOT EXISTS age_groups JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS min_age_unit TEXT NOT NULL DEFAULT 'years',
  ADD COLUMN IF NOT EXISTS max_age_unit TEXT NOT NULL DEFAULT 'years',

  -- Section 13: IPD & Results
  ADD COLUMN IF NOT EXISTS ipd_additional_docs JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ipd_sharing_timeframe TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ipd_access_criteria TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ipd_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS results_available TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS results_summary_docs JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS results_first_publication_date TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS results_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS results_protocol_link TEXT NOT NULL DEFAULT '';

-- Update the sync trigger function
CREATE OR REPLACE FUNCTION sync_trial_registry_form_from_trials()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO trial_registry_forms (
    trial_id,
    -- Section 1
    title, brief_summary, trial_design, trial_phase, diseases, purpose,
    anticipated_start_date, actual_start_date, last_follow_up_date, completion_date,
    target_participants, project_area, recruitment_status, publication_url,
    acronym, final_participants,
    -- Section 2
    has_secondary_id, secondary_ids, secondary_id_issuing_authority,
    -- Section 3
    intervention_assignment, allocation, allocation_concealment, masking_type,
    masking_roles,
    -- Multiple sections (4, 6, 7, 8, 9, 10, 11, 12, 13)
    interventions, outcomes, recruitment_centres, ethics_approvals,
    funding_sources, sponsors, collaborators, contact_persons,
    -- Section 5
    inclusion_criteria, exclusion_criteria, min_age, max_age, sex,
    age_groups, min_age_unit, max_age_unit,
    -- Section 13
    ipd_description, ipd_additional_docs, ipd_sharing_timeframe, ipd_access_criteria,
    ipd_url, results_available, results_summary_docs, results_first_publication_date,
    results_urls, results_protocol_link,
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
    COALESCE(NEW.data->>'acronym', ''),
    COALESCE(NEW.data->>'finalParticipants', ''),
    
    COALESCE(NEW.data->>'hasSecondaryId', ''),
    COALESCE(NEW.data->>'secondaryIds', ''),
    COALESCE(NEW.data->>'secondaryIdIssuingAuthority', ''),
    
    COALESCE(NEW.data->>'interventionAssignment', ''),
    COALESCE(NEW.data->>'allocation', ''),
    COALESCE(NEW.data->>'allocationConcealment', ''),
    COALESCE(NEW.data->>'maskingType', ''),
    COALESCE(NEW.data->'maskingRoles', '[]'::jsonb),
    
    COALESCE(NEW.data->'interventions', '[]'::jsonb),
    COALESCE(NEW.data->'outcomes', '[]'::jsonb),
    COALESCE(NEW.data->'recruitmentCentres', '[]'::jsonb),
    COALESCE(NEW.data->'ethicsApprovals', '[]'::jsonb),
    COALESCE(NEW.data->'fundingSources', '[]'::jsonb),
    COALESCE(NEW.data->'sponsors', '[]'::jsonb),
    COALESCE(NEW.data->'collaborators', '[]'::jsonb),
    COALESCE(NEW.data->'contactPersons', '[]'::jsonb),
    
    COALESCE(NEW.data->>'inclusionCriteria', ''),
    COALESCE(NEW.data->>'exclusionCriteria', ''),
    COALESCE(NEW.data->>'minAge', ''),
    COALESCE(NEW.data->>'maxAge', ''),
    COALESCE(NEW.data->>'sex', ''),
    COALESCE(NEW.data->'ageGroups', '[]'::jsonb),
    COALESCE(NEW.data->>'minAgeUnit', 'years'),
    COALESCE(NEW.data->>'maxAgeUnit', 'years'),
    
    COALESCE(NEW.data->>'ipdDescription', ''),
    COALESCE(NEW.data->'ipdAdditionalDocs', '[]'::jsonb),
    COALESCE(NEW.data->>'ipdSharingTimeframe', ''),
    COALESCE(NEW.data->>'ipdAccessCriteria', ''),
    COALESCE(NEW.data->>'ipdUrl', ''),
    COALESCE(NEW.data->>'resultsAvailable', ''),
    COALESCE(NEW.data->'resultsSummaryDocs', '[]'::jsonb),
    COALESCE(NEW.data->>'resultsFirstPublicationDate', ''),
    COALESCE(NEW.data->'resultsUrls', '[]'::jsonb),
    COALESCE(NEW.data->>'resultsProtocolLink', ''),
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
    acronym = EXCLUDED.acronym,
    final_participants = EXCLUDED.final_participants,
    has_secondary_id = EXCLUDED.has_secondary_id,
    secondary_ids = EXCLUDED.secondary_ids,
    secondary_id_issuing_authority = EXCLUDED.secondary_id_issuing_authority,
    intervention_assignment = EXCLUDED.intervention_assignment,
    allocation = EXCLUDED.allocation,
    allocation_concealment = EXCLUDED.allocation_concealment,
    masking_type = EXCLUDED.masking_type,
    masking_roles = EXCLUDED.masking_roles,
    interventions = EXCLUDED.interventions,
    outcomes = EXCLUDED.outcomes,
    recruitment_centres = EXCLUDED.recruitment_centres,
    ethics_approvals = EXCLUDED.ethics_approvals,
    funding_sources = EXCLUDED.funding_sources,
    sponsors = EXCLUDED.sponsors,
    collaborators = EXCLUDED.collaborators,
    contact_persons = EXCLUDED.contact_persons,
    inclusion_criteria = EXCLUDED.inclusion_criteria,
    exclusion_criteria = EXCLUDED.exclusion_criteria,
    min_age = EXCLUDED.min_age,
    max_age = EXCLUDED.max_age,
    sex = EXCLUDED.sex,
    age_groups = EXCLUDED.age_groups,
    min_age_unit = EXCLUDED.min_age_unit,
    max_age_unit = EXCLUDED.max_age_unit,
    ipd_description = EXCLUDED.ipd_description,
    ipd_additional_docs = EXCLUDED.ipd_additional_docs,
    ipd_sharing_timeframe = EXCLUDED.ipd_sharing_timeframe,
    ipd_access_criteria = EXCLUDED.ipd_access_criteria,
    ipd_url = EXCLUDED.ipd_url,
    results_available = EXCLUDED.results_available,
    results_summary_docs = EXCLUDED.results_summary_docs,
    results_first_publication_date = EXCLUDED.results_first_publication_date,
    results_urls = EXCLUDED.results_urls,
    results_protocol_link = EXCLUDED.results_protocol_link,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Force trigger population for all existing rows
UPDATE trials SET data = data;
