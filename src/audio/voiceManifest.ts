const voiceModules: Record<string, Record<string, ReturnType<typeof require>>> = {
  breath_478: {
    breath_478_deepening: require('../../assets/audio/voice/breath_478/breath_478_deepening.mp3'),
    breath_478_integration: require('../../assets/audio/voice/breath_478/breath_478_integration.mp3'),
    breath_478_learning_counts: require('../../assets/audio/voice/breath_478/breath_478_learning_counts.mp3'),
    breath_478_method_intro: require('../../assets/audio/voice/breath_478/breath_478_method_intro.mp3'),
    breath_478_practice_start: require('../../assets/audio/voice/breath_478/breath_478_practice_start.mp3'),
    breath_478_preparation: require('../../assets/audio/voice/breath_478/breath_478_preparation.mp3'),
    breath_478_reorientation: require('../../assets/audio/voice/breath_478/breath_478_reorientation.mp3')
  },
  breath_box: {
    breath_box_extension: require('../../assets/audio/voice/breath_box/breath_box_extension.mp3'),
    breath_box_integration: require('../../assets/audio/voice/breath_box/breath_box_integration.mp3'),
    breath_box_learning_pattern: require('../../assets/audio/voice/breath_box/breath_box_learning_pattern.mp3'),
    breath_box_practice_start: require('../../assets/audio/voice/breath_box/breath_box_practice_start.mp3'),
    breath_box_preparation: require('../../assets/audio/voice/breath_box/breath_box_preparation.mp3'),
    breath_box_reorientation: require('../../assets/audio/voice/breath_box/breath_box_reorientation.mp3'),
    breath_box_rhythm_concept: require('../../assets/audio/voice/breath_box/breath_box_rhythm_concept.mp3')
  },
  breath_coherent: {
    breath_coherent_finding_rhythm: require('../../assets/audio/voice/breath_coherent/breath_coherent_finding_rhythm.mp3'),
    breath_coherent_heart_connection: require('../../assets/audio/voice/breath_coherent/breath_coherent_heart_connection.mp3'),
    breath_coherent_hrv_concept: require('../../assets/audio/voice/breath_coherent/breath_coherent_hrv_concept.mp3'),
    breath_coherent_integration: require('../../assets/audio/voice/breath_coherent/breath_coherent_integration.mp3'),
    breath_coherent_practice_start: require('../../assets/audio/voice/breath_coherent/breath_coherent_practice_start.mp3'),
    breath_coherent_preparation: require('../../assets/audio/voice/breath_coherent/breath_coherent_preparation.mp3'),
    breath_coherent_reorientation: require('../../assets/audio/voice/breath_coherent/breath_coherent_reorientation.mp3')
  },
  breath_diaphragmatic: {
    breath_diaphragmatic_deepening: require('../../assets/audio/voice/breath_diaphragmatic/breath_diaphragmatic_deepening.mp3'),
    breath_diaphragmatic_exploring_breath: require('../../assets/audio/voice/breath_diaphragmatic/breath_diaphragmatic_exploring_breath.mp3'),
    breath_diaphragmatic_hand_placement: require('../../assets/audio/voice/breath_diaphragmatic/breath_diaphragmatic_hand_placement.mp3'),
    breath_diaphragmatic_integration: require('../../assets/audio/voice/breath_diaphragmatic/breath_diaphragmatic_integration.mp3'),
    breath_diaphragmatic_practice_start: require('../../assets/audio/voice/breath_diaphragmatic/breath_diaphragmatic_practice_start.mp3'),
    breath_diaphragmatic_preparation: require('../../assets/audio/voice/breath_diaphragmatic/breath_diaphragmatic_preparation.mp3'),
    breath_diaphragmatic_reorientation: require('../../assets/audio/voice/breath_diaphragmatic/breath_diaphragmatic_reorientation.mp3')
  },
  breath_for_sleep: {
    breath_for_sleep_deepening: require('../../assets/audio/voice/breath_for_sleep/breath_for_sleep_deepening.mp3'),
    breath_for_sleep_drifting: require('../../assets/audio/voice/breath_for_sleep/breath_for_sleep_drifting.mp3'),
    breath_for_sleep_extended_exhale: require('../../assets/audio/voice/breath_for_sleep/breath_for_sleep_extended_exhale.mp3'),
    breath_for_sleep_gentle_practice: require('../../assets/audio/voice/breath_for_sleep/breath_for_sleep_gentle_practice.mp3'),
    breath_for_sleep_letting_go: require('../../assets/audio/voice/breath_for_sleep/breath_for_sleep_letting_go.mp3'),
    breath_for_sleep_preparation: require('../../assets/audio/voice/breath_for_sleep/breath_for_sleep_preparation.mp3'),
    breath_for_sleep_settling: require('../../assets/audio/voice/breath_for_sleep/breath_for_sleep_settling.mp3')
  },
  breath_holotropic: {
    breath_holotropic_breathing_pattern: require('../../assets/audio/voice/breath_holotropic/breath_holotropic_breathing_pattern.mp3'),
    breath_holotropic_consent: require('../../assets/audio/voice/breath_holotropic/breath_holotropic_consent.mp3'),
    breath_holotropic_entering_session: require('../../assets/audio/voice/breath_holotropic/breath_holotropic_entering_session.mp3'),
    breath_holotropic_gradual_return: require('../../assets/audio/voice/breath_holotropic/breath_holotropic_gradual_return.mp3'),
    breath_holotropic_grounding: require('../../assets/audio/voice/breath_holotropic/breath_holotropic_grounding.mp3'),
    breath_holotropic_maintaining: require('../../assets/audio/voice/breath_holotropic/breath_holotropic_maintaining.mp3'),
    breath_holotropic_preparation: require('../../assets/audio/voice/breath_holotropic/breath_holotropic_preparation.mp3'),
    breath_holotropic_reorientation: require('../../assets/audio/voice/breath_holotropic/breath_holotropic_reorientation.mp3'),
    breath_holotropic_safety_guidelines: require('../../assets/audio/voice/breath_holotropic/breath_holotropic_safety_guidelines.mp3')
  },
  breath_pranayama: {
    breath_pranayama_integration: require('../../assets/audio/voice/breath_pranayama/breath_pranayama_integration.mp3'),
    breath_pranayama_kapalabhati_intro: require('../../assets/audio/voice/breath_pranayama/breath_pranayama_kapalabhati_intro.mp3'),
    breath_pranayama_kapalabhati_practice: require('../../assets/audio/voice/breath_pranayama/breath_pranayama_kapalabhati_practice.mp3'),
    breath_pranayama_nadi_shodhana_intro: require('../../assets/audio/voice/breath_pranayama/breath_pranayama_nadi_shodhana_intro.mp3'),
    breath_pranayama_nadi_shodhana_practice: require('../../assets/audio/voice/breath_pranayama/breath_pranayama_nadi_shodhana_practice.mp3'),
    breath_pranayama_prana_concept: require('../../assets/audio/voice/breath_pranayama/breath_pranayama_prana_concept.mp3'),
    breath_pranayama_preparation: require('../../assets/audio/voice/breath_pranayama/breath_pranayama_preparation.mp3'),
    breath_pranayama_reorientation: require('../../assets/audio/voice/breath_pranayama/breath_pranayama_reorientation.mp3')
  },
  breath_wim_hof: {
    breath_wim_hof_consent: require('../../assets/audio/voice/breath_wim_hof/breath_wim_hof_consent.mp3'),
    breath_wim_hof_first_round: require('../../assets/audio/voice/breath_wim_hof/breath_wim_hof_first_round.mp3'),
    breath_wim_hof_integration: require('../../assets/audio/voice/breath_wim_hof/breath_wim_hof_integration.mp3'),
    breath_wim_hof_learning_pattern: require('../../assets/audio/voice/breath_wim_hof/breath_wim_hof_learning_pattern.mp3'),
    breath_wim_hof_preparation: require('../../assets/audio/voice/breath_wim_hof/breath_wim_hof_preparation.mp3'),
    breath_wim_hof_recovery_breath: require('../../assets/audio/voice/breath_wim_hof/breath_wim_hof_recovery_breath.mp3'),
    breath_wim_hof_reorientation: require('../../assets/audio/voice/breath_wim_hof/breath_wim_hof_reorientation.mp3'),
    breath_wim_hof_retention: require('../../assets/audio/voice/breath_wim_hof/breath_wim_hof_retention.mp3'),
    breath_wim_hof_retention_2: require('../../assets/audio/voice/breath_wim_hof/breath_wim_hof_retention_2.mp3'),
    breath_wim_hof_safety_rules: require('../../assets/audio/voice/breath_wim_hof/breath_wim_hof_safety_rules.mp3'),
    breath_wim_hof_second_round: require('../../assets/audio/voice/breath_wim_hof/breath_wim_hof_second_round.mp3')
  },
  dfp_alpha_calibration: {
    dfp_alpha_calibration_deepening: require('../../assets/audio/voice/dfp_alpha_calibration/dfp_alpha_calibration_deepening.mp3'),
    dfp_alpha_calibration_deepening2: require('../../assets/audio/voice/dfp_alpha_calibration/dfp_alpha_calibration_deepening2.mp3'),
    dfp_alpha_calibration_induction: require('../../assets/audio/voice/dfp_alpha_calibration/dfp_alpha_calibration_induction.mp3'),
    dfp_alpha_calibration_integration: require('../../assets/audio/voice/dfp_alpha_calibration/dfp_alpha_calibration_integration.mp3'),
    dfp_alpha_calibration_practice: require('../../assets/audio/voice/dfp_alpha_calibration/dfp_alpha_calibration_practice.mp3'),
    dfp_alpha_calibration_preparation: require('../../assets/audio/voice/dfp_alpha_calibration/dfp_alpha_calibration_preparation.mp3'),
    dfp_alpha_calibration_reorientation: require('../../assets/audio/voice/dfp_alpha_calibration/dfp_alpha_calibration_reorientation.mp3')
  },
  dfp_body_scan: {
    dfp_body_scan_awareness: require('../../assets/audio/voice/dfp_body_scan/dfp_body_scan_awareness.mp3'),
    dfp_body_scan_deepening: require('../../assets/audio/voice/dfp_body_scan/dfp_body_scan_deepening.mp3'),
    dfp_body_scan_integration: require('../../assets/audio/voice/dfp_body_scan/dfp_body_scan_integration.mp3'),
    dfp_body_scan_mapping: require('../../assets/audio/voice/dfp_body_scan/dfp_body_scan_mapping.mp3'),
    dfp_body_scan_practice: require('../../assets/audio/voice/dfp_body_scan/dfp_body_scan_practice.mp3'),
    dfp_body_scan_preparation: require('../../assets/audio/voice/dfp_body_scan/dfp_body_scan_preparation.mp3'),
    dfp_body_scan_reorientation: require('../../assets/audio/voice/dfp_body_scan/dfp_body_scan_reorientation.mp3')
  },
  dfp_diagnosis: {
    dfp_diagnosis_deepening: require('../../assets/audio/voice/dfp_diagnosis/dfp_diagnosis_deepening.mp3'),
    dfp_diagnosis_exploring: require('../../assets/audio/voice/dfp_diagnosis/dfp_diagnosis_exploring.mp3'),
    dfp_diagnosis_integration: require('../../assets/audio/voice/dfp_diagnosis/dfp_diagnosis_integration.mp3'),
    dfp_diagnosis_practice: require('../../assets/audio/voice/dfp_diagnosis/dfp_diagnosis_practice.mp3'),
    dfp_diagnosis_preparation: require('../../assets/audio/voice/dfp_diagnosis/dfp_diagnosis_preparation.mp3'),
    dfp_diagnosis_reorientation: require('../../assets/audio/voice/dfp_diagnosis/dfp_diagnosis_reorientation.mp3'),
    dfp_diagnosis_scanning: require('../../assets/audio/voice/dfp_diagnosis/dfp_diagnosis_scanning.mp3')
  },
  dfp_emotional_saturation: {
    dfp_emotional_saturation_building: require('../../assets/audio/voice/dfp_emotional_saturation/dfp_emotional_saturation_building.mp3'),
    dfp_emotional_saturation_deepening: require('../../assets/audio/voice/dfp_emotional_saturation/dfp_emotional_saturation_deepening.mp3'),
    dfp_emotional_saturation_exploring: require('../../assets/audio/voice/dfp_emotional_saturation/dfp_emotional_saturation_exploring.mp3'),
    dfp_emotional_saturation_integration: require('../../assets/audio/voice/dfp_emotional_saturation/dfp_emotional_saturation_integration.mp3'),
    dfp_emotional_saturation_practice: require('../../assets/audio/voice/dfp_emotional_saturation/dfp_emotional_saturation_practice.mp3'),
    dfp_emotional_saturation_preparation: require('../../assets/audio/voice/dfp_emotional_saturation/dfp_emotional_saturation_preparation.mp3'),
    dfp_emotional_saturation_reorientation: require('../../assets/audio/voice/dfp_emotional_saturation/dfp_emotional_saturation_reorientation.mp3')
  },
  dfp_focus_lock: {
    dfp_focus_lock_deepening: require('../../assets/audio/voice/dfp_focus_lock/dfp_focus_lock_deepening.mp3'),
    dfp_focus_lock_integration: require('../../assets/audio/voice/dfp_focus_lock/dfp_focus_lock_integration.mp3'),
    dfp_focus_lock_intention: require('../../assets/audio/voice/dfp_focus_lock/dfp_focus_lock_intention.mp3'),
    dfp_focus_lock_practice: require('../../assets/audio/voice/dfp_focus_lock/dfp_focus_lock_practice.mp3'),
    dfp_focus_lock_preparation: require('../../assets/audio/voice/dfp_focus_lock/dfp_focus_lock_preparation.mp3'),
    dfp_focus_lock_reorientation: require('../../assets/audio/voice/dfp_focus_lock/dfp_focus_lock_reorientation.mp3'),
    dfp_focus_lock_sharpening: require('../../assets/audio/voice/dfp_focus_lock/dfp_focus_lock_sharpening.mp3')
  },
  dfp_morning_tuning: {
    dfp_morning_tuning_awakening: require('../../assets/audio/voice/dfp_morning_tuning/dfp_morning_tuning_awakening.mp3'),
    dfp_morning_tuning_deepening: require('../../assets/audio/voice/dfp_morning_tuning/dfp_morning_tuning_deepening.mp3'),
    dfp_morning_tuning_frequency: require('../../assets/audio/voice/dfp_morning_tuning/dfp_morning_tuning_frequency.mp3'),
    dfp_morning_tuning_integration: require('../../assets/audio/voice/dfp_morning_tuning/dfp_morning_tuning_integration.mp3'),
    dfp_morning_tuning_practice: require('../../assets/audio/voice/dfp_morning_tuning/dfp_morning_tuning_practice.mp3'),
    dfp_morning_tuning_preparation: require('../../assets/audio/voice/dfp_morning_tuning/dfp_morning_tuning_preparation.mp3'),
    dfp_morning_tuning_reorientation: require('../../assets/audio/voice/dfp_morning_tuning/dfp_morning_tuning_reorientation.mp3')
  },
  dfp_night_integration: {
    dfp_night_integration_deepening: require('../../assets/audio/voice/dfp_night_integration/dfp_night_integration_deepening.mp3'),
    dfp_night_integration_integration: require('../../assets/audio/voice/dfp_night_integration/dfp_night_integration_integration.mp3'),
    dfp_night_integration_practice: require('../../assets/audio/voice/dfp_night_integration/dfp_night_integration_practice.mp3'),
    dfp_night_integration_preparation: require('../../assets/audio/voice/dfp_night_integration/dfp_night_integration_preparation.mp3'),
    dfp_night_integration_programming: require('../../assets/audio/voice/dfp_night_integration/dfp_night_integration_programming.mp3'),
    dfp_night_integration_releasing: require('../../assets/audio/voice/dfp_night_integration/dfp_night_integration_releasing.mp3'),
    dfp_night_integration_reorientation: require('../../assets/audio/voice/dfp_night_integration/dfp_night_integration_reorientation.mp3')
  },
  dfp_proactive_projection: {
    dfp_proactive_projection_broadcasting: require('../../assets/audio/voice/dfp_proactive_projection/dfp_proactive_projection_broadcasting.mp3'),
    dfp_proactive_projection_building: require('../../assets/audio/voice/dfp_proactive_projection/dfp_proactive_projection_building.mp3'),
    dfp_proactive_projection_exploring: require('../../assets/audio/voice/dfp_proactive_projection/dfp_proactive_projection_exploring.mp3'),
    dfp_proactive_projection_integration: require('../../assets/audio/voice/dfp_proactive_projection/dfp_proactive_projection_integration.mp3'),
    dfp_proactive_projection_practice: require('../../assets/audio/voice/dfp_proactive_projection/dfp_proactive_projection_practice.mp3'),
    dfp_proactive_projection_preparation: require('../../assets/audio/voice/dfp_proactive_projection/dfp_proactive_projection_preparation.mp3'),
    dfp_proactive_projection_reorientation: require('../../assets/audio/voice/dfp_proactive_projection/dfp_proactive_projection_reorientation.mp3')
  },
  dfp_three_day_protocol: {
    dfp_three_day_protocol_day_one: require('../../assets/audio/voice/dfp_three_day_protocol/dfp_three_day_protocol_day_one.mp3'),
    dfp_three_day_protocol_day_three: require('../../assets/audio/voice/dfp_three_day_protocol/dfp_three_day_protocol_day_three.mp3'),
    dfp_three_day_protocol_day_two: require('../../assets/audio/voice/dfp_three_day_protocol/dfp_three_day_protocol_day_two.mp3'),
    dfp_three_day_protocol_integration: require('../../assets/audio/voice/dfp_three_day_protocol/dfp_three_day_protocol_integration.mp3'),
    dfp_three_day_protocol_practice: require('../../assets/audio/voice/dfp_three_day_protocol/dfp_three_day_protocol_practice.mp3'),
    dfp_three_day_protocol_preparation: require('../../assets/audio/voice/dfp_three_day_protocol/dfp_three_day_protocol_preparation.mp3'),
    dfp_three_day_protocol_reorientation: require('../../assets/audio/voice/dfp_three_day_protocol/dfp_three_day_protocol_reorientation.mp3')
  },
  dfp_zero_contradictions: {
    dfp_zero_contradictions_alignment: require('../../assets/audio/voice/dfp_zero_contradictions/dfp_zero_contradictions_alignment.mp3'),
    dfp_zero_contradictions_deepening: require('../../assets/audio/voice/dfp_zero_contradictions/dfp_zero_contradictions_deepening.mp3'),
    dfp_zero_contradictions_exploring: require('../../assets/audio/voice/dfp_zero_contradictions/dfp_zero_contradictions_exploring.mp3'),
    dfp_zero_contradictions_integration: require('../../assets/audio/voice/dfp_zero_contradictions/dfp_zero_contradictions_integration.mp3'),
    dfp_zero_contradictions_practice: require('../../assets/audio/voice/dfp_zero_contradictions/dfp_zero_contradictions_practice.mp3'),
    dfp_zero_contradictions_preparation: require('../../assets/audio/voice/dfp_zero_contradictions/dfp_zero_contradictions_preparation.mp3'),
    dfp_zero_contradictions_reorientation: require('../../assets/audio/voice/dfp_zero_contradictions/dfp_zero_contradictions_reorientation.mp3')
  },
  disp_becoming_supernatural: {
    disp_becoming_supernatural_deepening: require('../../assets/audio/voice/disp_becoming_supernatural/disp_becoming_supernatural_deepening.mp3'),
    disp_becoming_supernatural_induction: require('../../assets/audio/voice/disp_becoming_supernatural/disp_becoming_supernatural_induction.mp3'),
    disp_becoming_supernatural_integration: require('../../assets/audio/voice/disp_becoming_supernatural/disp_becoming_supernatural_integration.mp3'),
    disp_becoming_supernatural_potential_feeling: require('../../assets/audio/voice/disp_becoming_supernatural/disp_becoming_supernatural_potential_feeling.mp3'),
    disp_becoming_supernatural_preparation: require('../../assets/audio/voice/disp_becoming_supernatural/disp_becoming_supernatural_preparation.mp3'),
    disp_becoming_supernatural_quantum_concept: require('../../assets/audio/voice/disp_becoming_supernatural/disp_becoming_supernatural_quantum_concept.mp3'),
    disp_becoming_supernatural_reorientation: require('../../assets/audio/voice/disp_becoming_supernatural/disp_becoming_supernatural_reorientation.mp3')
  },
  disp_being_supernatural: {
    disp_being_supernatural_anchoring: require('../../assets/audio/voice/disp_being_supernatural/disp_being_supernatural_anchoring.mp3'),
    disp_being_supernatural_deepening: require('../../assets/audio/voice/disp_being_supernatural/disp_being_supernatural_deepening.mp3'),
    disp_being_supernatural_induction: require('../../assets/audio/voice/disp_being_supernatural/disp_being_supernatural_induction.mp3'),
    disp_being_supernatural_leaving_body: require('../../assets/audio/voice/disp_being_supernatural/disp_being_supernatural_leaving_body.mp3'),
    disp_being_supernatural_new_identity: require('../../assets/audio/voice/disp_being_supernatural/disp_being_supernatural_new_identity.mp3'),
    disp_being_supernatural_preparation: require('../../assets/audio/voice/disp_being_supernatural/disp_being_supernatural_preparation.mp3'),
    disp_being_supernatural_quantum_entry: require('../../assets/audio/voice/disp_being_supernatural/disp_being_supernatural_quantum_entry.mp3'),
    disp_being_supernatural_reorientation: require('../../assets/audio/voice/disp_being_supernatural/disp_being_supernatural_reorientation.mp3'),
    disp_being_supernatural_returning_transformed: require('../../assets/audio/voice/disp_being_supernatural/disp_being_supernatural_returning_transformed.mp3')
  },
  disp_blessed_cells: {
    disp_blessed_cells_cell_blessing: require('../../assets/audio/voice/disp_blessed_cells/disp_blessed_cells_cell_blessing.mp3'),
    disp_blessed_cells_deepening: require('../../assets/audio/voice/disp_blessed_cells/disp_blessed_cells_deepening.mp3'),
    disp_blessed_cells_entering_body: require('../../assets/audio/voice/disp_blessed_cells/disp_blessed_cells_entering_body.mp3'),
    disp_blessed_cells_induction: require('../../assets/audio/voice/disp_blessed_cells/disp_blessed_cells_induction.mp3'),
    disp_blessed_cells_integration: require('../../assets/audio/voice/disp_blessed_cells/disp_blessed_cells_integration.mp3'),
    disp_blessed_cells_preparation: require('../../assets/audio/voice/disp_blessed_cells/disp_blessed_cells_preparation.mp3'),
    disp_blessed_cells_regeneration: require('../../assets/audio/voice/disp_blessed_cells/disp_blessed_cells_regeneration.mp3'),
    disp_blessed_cells_reorientation: require('../../assets/audio/voice/disp_blessed_cells/disp_blessed_cells_reorientation.mp3')
  },
  disp_body_parts_induction: {
    disp_body_parts_induction_arms_hands: require('../../assets/audio/voice/disp_body_parts_induction/disp_body_parts_induction_arms_hands.mp3'),
    disp_body_parts_induction_head_face: require('../../assets/audio/voice/disp_body_parts_induction/disp_body_parts_induction_head_face.mp3'),
    disp_body_parts_induction_induction: require('../../assets/audio/voice/disp_body_parts_induction/disp_body_parts_induction_induction.mp3'),
    disp_body_parts_induction_integration: require('../../assets/audio/voice/disp_body_parts_induction/disp_body_parts_induction_integration.mp3'),
    disp_body_parts_induction_legs_feet: require('../../assets/audio/voice/disp_body_parts_induction/disp_body_parts_induction_legs_feet.mp3'),
    disp_body_parts_induction_neck_shoulders: require('../../assets/audio/voice/disp_body_parts_induction/disp_body_parts_induction_neck_shoulders.mp3'),
    disp_body_parts_induction_preparation: require('../../assets/audio/voice/disp_body_parts_induction/disp_body_parts_induction_preparation.mp3'),
    disp_body_parts_induction_reorientation: require('../../assets/audio/voice/disp_body_parts_induction/disp_body_parts_induction_reorientation.mp3'),
    disp_body_parts_induction_torso: require('../../assets/audio/voice/disp_body_parts_induction/disp_body_parts_induction_torso.mp3'),
    disp_body_parts_induction_whole_body: require('../../assets/audio/voice/disp_body_parts_induction/disp_body_parts_induction_whole_body.mp3')
  },
  disp_changing_beliefs: {
    disp_changing_beliefs_belief_concept: require('../../assets/audio/voice/disp_changing_beliefs/disp_changing_beliefs_belief_concept.mp3'),
    disp_changing_beliefs_deepening: require('../../assets/audio/voice/disp_changing_beliefs/disp_changing_beliefs_deepening.mp3'),
    disp_changing_beliefs_identifying_limiting: require('../../assets/audio/voice/disp_changing_beliefs/disp_changing_beliefs_identifying_limiting.mp3'),
    disp_changing_beliefs_induction: require('../../assets/audio/voice/disp_changing_beliefs/disp_changing_beliefs_induction.mp3'),
    disp_changing_beliefs_integration: require('../../assets/audio/voice/disp_changing_beliefs/disp_changing_beliefs_integration.mp3'),
    disp_changing_beliefs_preparation: require('../../assets/audio/voice/disp_changing_beliefs/disp_changing_beliefs_preparation.mp3'),
    disp_changing_beliefs_reorientation: require('../../assets/audio/voice/disp_changing_beliefs/disp_changing_beliefs_reorientation.mp3'),
    disp_changing_beliefs_rewiring: require('../../assets/audio/voice/disp_changing_beliefs/disp_changing_beliefs_rewiring.mp3'),
    disp_changing_beliefs_unwiring: require('../../assets/audio/voice/disp_changing_beliefs/disp_changing_beliefs_unwiring.mp3')
  },
  disp_emotional_addiction: {
    disp_emotional_addiction_addiction_concept: require('../../assets/audio/voice/disp_emotional_addiction/disp_emotional_addiction_addiction_concept.mp3'),
    disp_emotional_addiction_body_sensations: require('../../assets/audio/voice/disp_emotional_addiction/disp_emotional_addiction_body_sensations.mp3'),
    disp_emotional_addiction_deepening: require('../../assets/audio/voice/disp_emotional_addiction/disp_emotional_addiction_deepening.mp3'),
    disp_emotional_addiction_induction: require('../../assets/audio/voice/disp_emotional_addiction/disp_emotional_addiction_induction.mp3'),
    disp_emotional_addiction_integration: require('../../assets/audio/voice/disp_emotional_addiction/disp_emotional_addiction_integration.mp3'),
    disp_emotional_addiction_liberation: require('../../assets/audio/voice/disp_emotional_addiction/disp_emotional_addiction_liberation.mp3'),
    disp_emotional_addiction_observing_emotions: require('../../assets/audio/voice/disp_emotional_addiction/disp_emotional_addiction_observing_emotions.mp3'),
    disp_emotional_addiction_preparation: require('../../assets/audio/voice/disp_emotional_addiction/disp_emotional_addiction_preparation.mp3'),
    disp_emotional_addiction_reorientation: require('../../assets/audio/voice/disp_emotional_addiction/disp_emotional_addiction_reorientation.mp3')
  },
  disp_generative_meditation: {
    disp_generative_meditation_becoming_nothing: require('../../assets/audio/voice/disp_generative_meditation/disp_generative_meditation_becoming_nothing.mp3'),
    disp_generative_meditation_creating_future: require('../../assets/audio/voice/disp_generative_meditation/disp_generative_meditation_creating_future.mp3'),
    disp_generative_meditation_deepening: require('../../assets/audio/voice/disp_generative_meditation/disp_generative_meditation_deepening.mp3'),
    disp_generative_meditation_embodying: require('../../assets/audio/voice/disp_generative_meditation/disp_generative_meditation_embodying.mp3'),
    disp_generative_meditation_entering_field: require('../../assets/audio/voice/disp_generative_meditation/disp_generative_meditation_entering_field.mp3'),
    disp_generative_meditation_induction: require('../../assets/audio/voice/disp_generative_meditation/disp_generative_meditation_induction.mp3'),
    disp_generative_meditation_integration: require('../../assets/audio/voice/disp_generative_meditation/disp_generative_meditation_integration.mp3'),
    disp_generative_meditation_preparation: require('../../assets/audio/voice/disp_generative_meditation/disp_generative_meditation_preparation.mp3'),
    disp_generative_meditation_reorientation: require('../../assets/audio/voice/disp_generative_meditation/disp_generative_meditation_reorientation.mp3')
  },
  disp_healing_meditation: {
    disp_healing_meditation_becoming_no_body: require('../../assets/audio/voice/disp_healing_meditation/disp_healing_meditation_becoming_no_body.mp3'),
    disp_healing_meditation_deepening: require('../../assets/audio/voice/disp_healing_meditation/disp_healing_meditation_deepening.mp3'),
    disp_healing_meditation_energetic_centers: require('../../assets/audio/voice/disp_healing_meditation/disp_healing_meditation_energetic_centers.mp3'),
    disp_healing_meditation_gratitude: require('../../assets/audio/voice/disp_healing_meditation/disp_healing_meditation_gratitude.mp3'),
    disp_healing_meditation_induction: require('../../assets/audio/voice/disp_healing_meditation/disp_healing_meditation_induction.mp3'),
    disp_healing_meditation_preparation: require('../../assets/audio/voice/disp_healing_meditation/disp_healing_meditation_preparation.mp3'),
    disp_healing_meditation_rebuilding: require('../../assets/audio/voice/disp_healing_meditation/disp_healing_meditation_rebuilding.mp3'),
    disp_healing_meditation_reorientation: require('../../assets/audio/voice/disp_healing_meditation/disp_healing_meditation_reorientation.mp3')
  },
  disp_heart_coherence: {
    disp_heart_coherence_coherence_breathing: require('../../assets/audio/voice/disp_heart_coherence/disp_heart_coherence_coherence_breathing.mp3'),
    disp_heart_coherence_deepening: require('../../assets/audio/voice/disp_heart_coherence/disp_heart_coherence_deepening.mp3'),
    disp_heart_coherence_expansion: require('../../assets/audio/voice/disp_heart_coherence/disp_heart_coherence_expansion.mp3'),
    disp_heart_coherence_heart_focus: require('../../assets/audio/voice/disp_heart_coherence/disp_heart_coherence_heart_focus.mp3'),
    disp_heart_coherence_induction: require('../../assets/audio/voice/disp_heart_coherence/disp_heart_coherence_induction.mp3'),
    disp_heart_coherence_integration: require('../../assets/audio/voice/disp_heart_coherence/disp_heart_coherence_integration.mp3'),
    disp_heart_coherence_preparation: require('../../assets/audio/voice/disp_heart_coherence/disp_heart_coherence_preparation.mp3'),
    disp_heart_coherence_reorientation: require('../../assets/audio/voice/disp_heart_coherence/disp_heart_coherence_reorientation.mp3')
  },
  disp_new_potentials: {
    disp_new_potentials_choosing_frequency: require('../../assets/audio/voice/disp_new_potentials/disp_new_potentials_choosing_frequency.mp3'),
    disp_new_potentials_deepening: require('../../assets/audio/voice/disp_new_potentials/disp_new_potentials_deepening.mp3'),
    disp_new_potentials_exploring_potentials: require('../../assets/audio/voice/disp_new_potentials/disp_new_potentials_exploring_potentials.mp3'),
    disp_new_potentials_induction: require('../../assets/audio/voice/disp_new_potentials/disp_new_potentials_induction.mp3'),
    disp_new_potentials_integration: require('../../assets/audio/voice/disp_new_potentials/disp_new_potentials_integration.mp3'),
    disp_new_potentials_preparation: require('../../assets/audio/voice/disp_new_potentials/disp_new_potentials_preparation.mp3'),
    disp_new_potentials_reorientation: require('../../assets/audio/voice/disp_new_potentials/disp_new_potentials_reorientation.mp3'),
    disp_new_potentials_tuning_nervous_system: require('../../assets/audio/voice/disp_new_potentials/disp_new_potentials_tuning_nervous_system.mp3')
  },
  disp_quantum_field: {
    disp_quantum_field_crossing_threshold: require('../../assets/audio/voice/disp_quantum_field/disp_quantum_field_crossing_threshold.mp3'),
    disp_quantum_field_deepening: require('../../assets/audio/voice/disp_quantum_field/disp_quantum_field_deepening.mp3'),
    disp_quantum_field_in_the_field: require('../../assets/audio/voice/disp_quantum_field/disp_quantum_field_in_the_field.mp3'),
    disp_quantum_field_induction: require('../../assets/audio/voice/disp_quantum_field/disp_quantum_field_induction.mp3'),
    disp_quantum_field_preparation: require('../../assets/audio/voice/disp_quantum_field/disp_quantum_field_preparation.mp3'),
    disp_quantum_field_receiving_potentials: require('../../assets/audio/voice/disp_quantum_field/disp_quantum_field_receiving_potentials.mp3'),
    disp_quantum_field_reorientation: require('../../assets/audio/voice/disp_quantum_field/disp_quantum_field_reorientation.mp3'),
    disp_quantum_field_returning: require('../../assets/audio/voice/disp_quantum_field/disp_quantum_field_returning.mp3')
  },
  disp_space_time: {
    disp_space_time_deepening: require('../../assets/audio/voice/disp_space_time/disp_space_time_deepening.mp3'),
    disp_space_time_dissolving_matter: require('../../assets/audio/voice/disp_space_time/disp_space_time_dissolving_matter.mp3'),
    disp_space_time_entering_void: require('../../assets/audio/voice/disp_space_time/disp_space_time_entering_void.mp3'),
    disp_space_time_induction: require('../../assets/audio/voice/disp_space_time/disp_space_time_induction.mp3'),
    disp_space_time_integration: require('../../assets/audio/voice/disp_space_time/disp_space_time_integration.mp3'),
    disp_space_time_preparation: require('../../assets/audio/voice/disp_space_time/disp_space_time_preparation.mp3'),
    disp_space_time_quantum_field: require('../../assets/audio/voice/disp_space_time/disp_space_time_quantum_field.mp3'),
    disp_space_time_reorientation: require('../../assets/audio/voice/disp_space_time/disp_space_time_reorientation.mp3')
  },
  disp_walking_creation: {
    disp_walking_creation_conscious_walking: require('../../assets/audio/voice/disp_walking_creation/disp_walking_creation_conscious_walking.mp3'),
    disp_walking_creation_deepening: require('../../assets/audio/voice/disp_walking_creation/disp_walking_creation_deepening.mp3'),
    disp_walking_creation_entering_state: require('../../assets/audio/voice/disp_walking_creation/disp_walking_creation_entering_state.mp3'),
    disp_walking_creation_induction: require('../../assets/audio/voice/disp_walking_creation/disp_walking_creation_induction.mp3'),
    disp_walking_creation_integrating: require('../../assets/audio/voice/disp_walking_creation/disp_walking_creation_integrating.mp3'),
    disp_walking_creation_preparation: require('../../assets/audio/voice/disp_walking_creation/disp_walking_creation_preparation.mp3'),
    disp_walking_creation_preparing_movement: require('../../assets/audio/voice/disp_walking_creation/disp_walking_creation_preparing_movement.mp3'),
    disp_walking_creation_reorientation: require('../../assets/audio/voice/disp_walking_creation/disp_walking_creation_reorientation.mp3')
  },
  feld_atlantic_puppet: {
    feld_atlantic_puppet_connecting: require('../../assets/audio/voice/feld_atlantic_puppet/feld_atlantic_puppet_connecting.mp3'),
    feld_atlantic_puppet_head_nodding: require('../../assets/audio/voice/feld_atlantic_puppet/feld_atlantic_puppet_head_nodding.mp3'),
    feld_atlantic_puppet_integration: require('../../assets/audio/voice/feld_atlantic_puppet/feld_atlantic_puppet_integration.mp3'),
    feld_atlantic_puppet_pelvic_response: require('../../assets/audio/voice/feld_atlantic_puppet/feld_atlantic_puppet_pelvic_response.mp3'),
    feld_atlantic_puppet_preparation: require('../../assets/audio/voice/feld_atlantic_puppet/feld_atlantic_puppet_preparation.mp3'),
    feld_atlantic_puppet_puppet_image: require('../../assets/audio/voice/feld_atlantic_puppet/feld_atlantic_puppet_puppet_image.mp3'),
    feld_atlantic_puppet_reorientation: require('../../assets/audio/voice/feld_atlantic_puppet/feld_atlantic_puppet_reorientation.mp3'),
    feld_atlantic_puppet_resting: require('../../assets/audio/voice/feld_atlantic_puppet/feld_atlantic_puppet_resting.mp3'),
    feld_atlantic_puppet_whole_puppet: require('../../assets/audio/voice/feld_atlantic_puppet/feld_atlantic_puppet_whole_puppet.mp3')
  },
  feld_atm_intro: {
    feld_atm_intro_first_scan: require('../../assets/audio/voice/feld_atm_intro/feld_atm_intro_first_scan.mp3'),
    feld_atm_intro_gentle_movement: require('../../assets/audio/voice/feld_atm_intro/feld_atm_intro_gentle_movement.mp3'),
    feld_atm_intro_integration: require('../../assets/audio/voice/feld_atm_intro/feld_atm_intro_integration.mp3'),
    feld_atm_intro_preparation: require('../../assets/audio/voice/feld_atm_intro/feld_atm_intro_preparation.mp3'),
    feld_atm_intro_principles: require('../../assets/audio/voice/feld_atm_intro/feld_atm_intro_principles.mp3'),
    feld_atm_intro_reorientation: require('../../assets/audio/voice/feld_atm_intro/feld_atm_intro_reorientation.mp3'),
    feld_atm_intro_second_scan: require('../../assets/audio/voice/feld_atm_intro/feld_atm_intro_second_scan.mp3')
  },
  feld_eyes: {
    feld_eyes_eye_movements: require('../../assets/audio/voice/feld_eyes/feld_eyes_eye_movements.mp3'),
    feld_eyes_integration: require('../../assets/audio/voice/feld_eyes/feld_eyes_integration.mp3'),
    feld_eyes_palming: require('../../assets/audio/voice/feld_eyes/feld_eyes_palming.mp3'),
    feld_eyes_peripheral: require('../../assets/audio/voice/feld_eyes/feld_eyes_peripheral.mp3'),
    feld_eyes_preparation: require('../../assets/audio/voice/feld_eyes/feld_eyes_preparation.mp3'),
    feld_eyes_reorientation: require('../../assets/audio/voice/feld_eyes/feld_eyes_reorientation.mp3'),
    feld_eyes_soft_gaze: require('../../assets/audio/voice/feld_eyes/feld_eyes_soft_gaze.mp3')
  },
  feld_pelvic_clock: {
    feld_pelvic_clock_circling: require('../../assets/audio/voice/feld_pelvic_clock/feld_pelvic_clock_circling.mp3'),
    feld_pelvic_clock_exploring_three: require('../../assets/audio/voice/feld_pelvic_clock/feld_pelvic_clock_exploring_three.mp3'),
    feld_pelvic_clock_exploring_twelve: require('../../assets/audio/voice/feld_pelvic_clock/feld_pelvic_clock_exploring_twelve.mp3'),
    feld_pelvic_clock_integration: require('../../assets/audio/voice/feld_pelvic_clock/feld_pelvic_clock_integration.mp3'),
    feld_pelvic_clock_lying_down: require('../../assets/audio/voice/feld_pelvic_clock/feld_pelvic_clock_lying_down.mp3'),
    feld_pelvic_clock_preparation: require('../../assets/audio/voice/feld_pelvic_clock/feld_pelvic_clock_preparation.mp3'),
    feld_pelvic_clock_reorientation: require('../../assets/audio/voice/feld_pelvic_clock/feld_pelvic_clock_reorientation.mp3'),
    feld_pelvic_clock_resting: require('../../assets/audio/voice/feld_pelvic_clock/feld_pelvic_clock_resting.mp3')
  },
  feld_ribcage: {
    feld_ribcage_back_ribs: require('../../assets/audio/voice/feld_ribcage/feld_ribcage_back_ribs.mp3'),
    feld_ribcage_comparison: require('../../assets/audio/voice/feld_ribcage/feld_ribcage_comparison.mp3'),
    feld_ribcage_full_breathing: require('../../assets/audio/voice/feld_ribcage/feld_ribcage_full_breathing.mp3'),
    feld_ribcage_initial_breath: require('../../assets/audio/voice/feld_ribcage/feld_ribcage_initial_breath.mp3'),
    feld_ribcage_preparation: require('../../assets/audio/voice/feld_ribcage/feld_ribcage_preparation.mp3'),
    feld_ribcage_reorientation: require('../../assets/audio/voice/feld_ribcage/feld_ribcage_reorientation.mp3'),
    feld_ribcage_side_ribs: require('../../assets/audio/voice/feld_ribcage/feld_ribcage_side_ribs.mp3')
  },
  feld_rolling: {
    feld_rolling_full_rolling: require('../../assets/audio/voice/feld_rolling/feld_rolling_full_rolling.mp3'),
    feld_rolling_grounding: require('../../assets/audio/voice/feld_rolling/feld_rolling_grounding.mp3'),
    feld_rolling_head_rolling: require('../../assets/audio/voice/feld_rolling/feld_rolling_head_rolling.mp3'),
    feld_rolling_integration: require('../../assets/audio/voice/feld_rolling/feld_rolling_integration.mp3'),
    feld_rolling_preparation: require('../../assets/audio/voice/feld_rolling/feld_rolling_preparation.mp3'),
    feld_rolling_reorientation: require('../../assets/audio/voice/feld_rolling/feld_rolling_reorientation.mp3'),
    feld_rolling_resting: require('../../assets/audio/voice/feld_rolling/feld_rolling_resting.mp3'),
    feld_rolling_shoulder_rolling: require('../../assets/audio/voice/feld_rolling/feld_rolling_shoulder_rolling.mp3')
  },
  feld_self_image: {
    feld_self_image_body_mapping: require('../../assets/audio/voice/feld_self_image/feld_self_image_body_mapping.mp3'),
    feld_self_image_current_image: require('../../assets/audio/voice/feld_self_image/feld_self_image_current_image.mp3'),
    feld_self_image_edge_exploration: require('../../assets/audio/voice/feld_self_image/feld_self_image_edge_exploration.mp3'),
    feld_self_image_expanding_image: require('../../assets/audio/voice/feld_self_image/feld_self_image_expanding_image.mp3'),
    feld_self_image_integrated_movement: require('../../assets/audio/voice/feld_self_image/feld_self_image_integrated_movement.mp3'),
    feld_self_image_new_image: require('../../assets/audio/voice/feld_self_image/feld_self_image_new_image.mp3'),
    feld_self_image_preparation: require('../../assets/audio/voice/feld_self_image/feld_self_image_preparation.mp3'),
    feld_self_image_reorientation: require('../../assets/audio/voice/feld_self_image/feld_self_image_reorientation.mp3')
  },
  feld_sitting_ease: {
    feld_sitting_ease_finding_sitbones: require('../../assets/audio/voice/feld_sitting_ease/feld_sitting_ease_finding_sitbones.mp3'),
    feld_sitting_ease_integration: require('../../assets/audio/voice/feld_sitting_ease/feld_sitting_ease_integration.mp3'),
    feld_sitting_ease_preparation: require('../../assets/audio/voice/feld_sitting_ease/feld_sitting_ease_preparation.mp3'),
    feld_sitting_ease_reorientation: require('../../assets/audio/voice/feld_sitting_ease/feld_sitting_ease_reorientation.mp3'),
    feld_sitting_ease_shifting_weight: require('../../assets/audio/voice/feld_sitting_ease/feld_sitting_ease_shifting_weight.mp3'),
    feld_sitting_ease_spine_lengthening: require('../../assets/audio/voice/feld_sitting_ease/feld_sitting_ease_spine_lengthening.mp3'),
    feld_sitting_ease_turning: require('../../assets/audio/voice/feld_sitting_ease/feld_sitting_ease_turning.mp3')
  },
  feld_spine_articulation: {
    feld_spine_articulation_combined: require('../../assets/audio/voice/feld_spine_articulation/feld_spine_articulation_combined.mp3'),
    feld_spine_articulation_preparation: require('../../assets/audio/voice/feld_spine_articulation/feld_spine_articulation_preparation.mp3'),
    feld_spine_articulation_reorientation: require('../../assets/audio/voice/feld_spine_articulation/feld_spine_articulation_reorientation.mp3'),
    feld_spine_articulation_rotation: require('../../assets/audio/voice/feld_spine_articulation/feld_spine_articulation_rotation.mp3'),
    feld_spine_articulation_side_bending: require('../../assets/audio/voice/feld_spine_articulation/feld_spine_articulation_side_bending.mp3'),
    feld_spine_articulation_standing_scan: require('../../assets/audio/voice/feld_spine_articulation/feld_spine_articulation_standing_scan.mp3'),
    feld_spine_articulation_supine_scan: require('../../assets/audio/voice/feld_spine_articulation/feld_spine_articulation_supine_scan.mp3')
  },
  feld_spine_chain: {
    feld_spine_chain_body_scan: require('../../assets/audio/voice/feld_spine_chain/feld_spine_chain_body_scan.mp3'),
    feld_spine_chain_full_chain: require('../../assets/audio/voice/feld_spine_chain/feld_spine_chain_full_chain.mp3'),
    feld_spine_chain_integration: require('../../assets/audio/voice/feld_spine_chain/feld_spine_chain_integration.mp3'),
    feld_spine_chain_lower_spine: require('../../assets/audio/voice/feld_spine_chain/feld_spine_chain_lower_spine.mp3'),
    feld_spine_chain_mid_spine: require('../../assets/audio/voice/feld_spine_chain/feld_spine_chain_mid_spine.mp3'),
    feld_spine_chain_preparation: require('../../assets/audio/voice/feld_spine_chain/feld_spine_chain_preparation.mp3'),
    feld_spine_chain_reorientation: require('../../assets/audio/voice/feld_spine_chain/feld_spine_chain_reorientation.mp3'),
    feld_spine_chain_upper_spine: require('../../assets/audio/voice/feld_spine_chain/feld_spine_chain_upper_spine.mp3')
  },
  feld_walking_awareness: {
    feld_walking_awareness_free_walking: require('../../assets/audio/voice/feld_walking_awareness/feld_walking_awareness_free_walking.mp3'),
    feld_walking_awareness_integration: require('../../assets/audio/voice/feld_walking_awareness/feld_walking_awareness_integration.mp3'),
    feld_walking_awareness_preparation: require('../../assets/audio/voice/feld_walking_awareness/feld_walking_awareness_preparation.mp3'),
    feld_walking_awareness_reorientation: require('../../assets/audio/voice/feld_walking_awareness/feld_walking_awareness_reorientation.mp3'),
    feld_walking_awareness_spine_in_walking: require('../../assets/audio/voice/feld_walking_awareness/feld_walking_awareness_spine_in_walking.mp3'),
    feld_walking_awareness_standing_scan: require('../../assets/audio/voice/feld_walking_awareness/feld_walking_awareness_standing_scan.mp3'),
    feld_walking_awareness_step_by_step: require('../../assets/audio/voice/feld_walking_awareness/feld_walking_awareness_step_by_step.mp3'),
    feld_walking_awareness_weight_shift: require('../../assets/audio/voice/feld_walking_awareness/feld_walking_awareness_weight_shift.mp3')
  },
  feld_weight_distribution: {
    feld_weight_distribution_circling: require('../../assets/audio/voice/feld_weight_distribution/feld_weight_distribution_circling.mp3'),
    feld_weight_distribution_diagonals: require('../../assets/audio/voice/feld_weight_distribution/feld_weight_distribution_diagonals.mp3'),
    feld_weight_distribution_exploring_base: require('../../assets/audio/voice/feld_weight_distribution/feld_weight_distribution_exploring_base.mp3'),
    feld_weight_distribution_forward_back: require('../../assets/audio/voice/feld_weight_distribution/feld_weight_distribution_forward_back.mp3'),
    feld_weight_distribution_integration: require('../../assets/audio/voice/feld_weight_distribution/feld_weight_distribution_integration.mp3'),
    feld_weight_distribution_preparation: require('../../assets/audio/voice/feld_weight_distribution/feld_weight_distribution_preparation.mp3'),
    feld_weight_distribution_reorientation: require('../../assets/audio/voice/feld_weight_distribution/feld_weight_distribution_reorientation.mp3'),
    feld_weight_distribution_side_to_side: require('../../assets/audio/voice/feld_weight_distribution/feld_weight_distribution_side_to_side.mp3')
  },
  silva_alpha_entry: {
    silva_alpha_entry_alpha_state: require('../../assets/audio/voice/silva_alpha_entry/silva_alpha_entry_alpha_state.mp3'),
    silva_alpha_entry_countdown: require('../../assets/audio/voice/silva_alpha_entry/silva_alpha_entry_countdown.mp3'),
    silva_alpha_entry_induction: require('../../assets/audio/voice/silva_alpha_entry/silva_alpha_entry_induction.mp3'),
    silva_alpha_entry_integration: require('../../assets/audio/voice/silva_alpha_entry/silva_alpha_entry_integration.mp3'),
    silva_alpha_entry_preparation: require('../../assets/audio/voice/silva_alpha_entry/silva_alpha_entry_preparation.mp3'),
    silva_alpha_entry_reorientation: require('../../assets/audio/voice/silva_alpha_entry/silva_alpha_entry_reorientation.mp3')
  },
  silva_case_working: {
    silva_case_working_deepening: require('../../assets/audio/voice/silva_case_working/silva_case_working_deepening.mp3'),
    silva_case_working_defining_problem: require('../../assets/audio/voice/silva_case_working/silva_case_working_defining_problem.mp3'),
    silva_case_working_induction: require('../../assets/audio/voice/silva_case_working/silva_case_working_induction.mp3'),
    silva_case_working_integration: require('../../assets/audio/voice/silva_case_working/silva_case_working_integration.mp3'),
    silva_case_working_preparation: require('../../assets/audio/voice/silva_case_working/silva_case_working_preparation.mp3'),
    silva_case_working_programming: require('../../assets/audio/voice/silva_case_working/silva_case_working_programming.mp3'),
    silva_case_working_projecting_solution: require('../../assets/audio/voice/silva_case_working/silva_case_working_projecting_solution.mp3'),
    silva_case_working_reorientation: require('../../assets/audio/voice/silva_case_working/silva_case_working_reorientation.mp3')
  },
  silva_creativity: {
    silva_creativity_capturing: require('../../assets/audio/voice/silva_creativity/silva_creativity_capturing.mp3'),
    silva_creativity_deepening: require('../../assets/audio/voice/silva_creativity/silva_creativity_deepening.mp3'),
    silva_creativity_idea_generation: require('../../assets/audio/voice/silva_creativity/silva_creativity_idea_generation.mp3'),
    silva_creativity_induction: require('../../assets/audio/voice/silva_creativity/silva_creativity_induction.mp3'),
    silva_creativity_integration: require('../../assets/audio/voice/silva_creativity/silva_creativity_integration.mp3'),
    silva_creativity_opening_channels: require('../../assets/audio/voice/silva_creativity/silva_creativity_opening_channels.mp3'),
    silva_creativity_preparation: require('../../assets/audio/voice/silva_creativity/silva_creativity_preparation.mp3'),
    silva_creativity_reorientation: require('../../assets/audio/voice/silva_creativity/silva_creativity_reorientation.mp3')
  },
  silva_cycle_28: {
    silva_cycle_28_affirmation_implant: require('../../assets/audio/voice/silva_cycle_28/silva_cycle_28_affirmation_implant.mp3'),
    silva_cycle_28_cycle_concept: require('../../assets/audio/voice/silva_cycle_28/silva_cycle_28_cycle_concept.mp3'),
    silva_cycle_28_deepening: require('../../assets/audio/voice/silva_cycle_28/silva_cycle_28_deepening.mp3'),
    silva_cycle_28_identifying_beliefs: require('../../assets/audio/voice/silva_cycle_28/silva_cycle_28_identifying_beliefs.mp3'),
    silva_cycle_28_induction: require('../../assets/audio/voice/silva_cycle_28/silva_cycle_28_induction.mp3'),
    silva_cycle_28_integration: require('../../assets/audio/voice/silva_cycle_28/silva_cycle_28_integration.mp3'),
    silva_cycle_28_preparation: require('../../assets/audio/voice/silva_cycle_28/silva_cycle_28_preparation.mp3'),
    silva_cycle_28_reorientation: require('../../assets/audio/voice/silva_cycle_28/silva_cycle_28_reorientation.mp3'),
    silva_cycle_28_reprogramming: require('../../assets/audio/voice/silva_cycle_28/silva_cycle_28_reprogramming.mp3')
  },
  silva_deep_relaxation: {
    silva_deep_relaxation_body_scan: require('../../assets/audio/voice/silva_deep_relaxation/silva_deep_relaxation_body_scan.mp3'),
    silva_deep_relaxation_induction: require('../../assets/audio/voice/silva_deep_relaxation/silva_deep_relaxation_induction.mp3'),
    silva_deep_relaxation_integration: require('../../assets/audio/voice/silva_deep_relaxation/silva_deep_relaxation_integration.mp3'),
    silva_deep_relaxation_preparation: require('../../assets/audio/voice/silva_deep_relaxation/silva_deep_relaxation_preparation.mp3'),
    silva_deep_relaxation_releasing_tension: require('../../assets/audio/voice/silva_deep_relaxation/silva_deep_relaxation_releasing_tension.mp3'),
    silva_deep_relaxation_reorientation: require('../../assets/audio/voice/silva_deep_relaxation/silva_deep_relaxation_reorientation.mp3')
  },
  silva_dream_control: {
    silva_dream_control_deepening: require('../../assets/audio/voice/silva_dream_control/silva_dream_control_deepening.mp3'),
    silva_dream_control_dream_concept: require('../../assets/audio/voice/silva_dream_control/silva_dream_control_dream_concept.mp3'),
    silva_dream_control_induction: require('../../assets/audio/voice/silva_dream_control/silva_dream_control_induction.mp3'),
    silva_dream_control_integration: require('../../assets/audio/voice/silva_dream_control/silva_dream_control_integration.mp3'),
    silva_dream_control_intent_setting: require('../../assets/audio/voice/silva_dream_control/silva_dream_control_intent_setting.mp3'),
    silva_dream_control_preparation: require('../../assets/audio/voice/silva_dream_control/silva_dream_control_preparation.mp3'),
    silva_dream_control_programming: require('../../assets/audio/voice/silva_dream_control/silva_dream_control_programming.mp3'),
    silva_dream_control_reorientation: require('../../assets/audio/voice/silva_dream_control/silva_dream_control_reorientation.mp3')
  },
  silva_five_senses: {
    silva_five_senses_deepening: require('../../assets/audio/voice/silva_five_senses/silva_five_senses_deepening.mp3'),
    silva_five_senses_induction: require('../../assets/audio/voice/silva_five_senses/silva_five_senses_induction.mp3'),
    silva_five_senses_integration: require('../../assets/audio/voice/silva_five_senses/silva_five_senses_integration.mp3'),
    silva_five_senses_preparation: require('../../assets/audio/voice/silva_five_senses/silva_five_senses_preparation.mp3'),
    silva_five_senses_reorientation: require('../../assets/audio/voice/silva_five_senses/silva_five_senses_reorientation.mp3'),
    silva_five_senses_sight: require('../../assets/audio/voice/silva_five_senses/silva_five_senses_sight.mp3'),
    silva_five_senses_smell_taste: require('../../assets/audio/voice/silva_five_senses/silva_five_senses_smell_taste.mp3'),
    silva_five_senses_sound: require('../../assets/audio/voice/silva_five_senses/silva_five_senses_sound.mp3'),
    silva_five_senses_touch: require('../../assets/audio/voice/silva_five_senses/silva_five_senses_touch.mp3')
  },
  silva_glass_water: {
    silva_glass_water_deepening: require('../../assets/audio/voice/silva_glass_water/silva_glass_water_deepening.mp3'),
    silva_glass_water_formulating_question: require('../../assets/audio/voice/silva_glass_water/silva_glass_water_formulating_question.mp3'),
    silva_glass_water_induction: require('../../assets/audio/voice/silva_glass_water/silva_glass_water_induction.mp3'),
    silva_glass_water_integration: require('../../assets/audio/voice/silva_glass_water/silva_glass_water_integration.mp3'),
    silva_glass_water_preparation: require('../../assets/audio/voice/silva_glass_water/silva_glass_water_preparation.mp3'),
    silva_glass_water_programming_glass: require('../../assets/audio/voice/silva_glass_water/silva_glass_water_programming_glass.mp3'),
    silva_glass_water_reorientation: require('../../assets/audio/voice/silva_glass_water/silva_glass_water_reorientation.mp3')
  },
  silva_habit_control: {
    silva_habit_control_deepening: require('../../assets/audio/voice/silva_habit_control/silva_habit_control_deepening.mp3'),
    silva_habit_control_identifying: require('../../assets/audio/voice/silva_habit_control/silva_habit_control_identifying.mp3'),
    silva_habit_control_induction: require('../../assets/audio/voice/silva_habit_control/silva_habit_control_induction.mp3'),
    silva_habit_control_installing_new: require('../../assets/audio/voice/silva_habit_control/silva_habit_control_installing_new.mp3'),
    silva_habit_control_integration: require('../../assets/audio/voice/silva_habit_control/silva_habit_control_integration.mp3'),
    silva_habit_control_preparation: require('../../assets/audio/voice/silva_habit_control/silva_habit_control_preparation.mp3'),
    silva_habit_control_releasing: require('../../assets/audio/voice/silva_habit_control/silva_habit_control_releasing.mp3'),
    silva_habit_control_reorientation: require('../../assets/audio/voice/silva_habit_control/silva_habit_control_reorientation.mp3')
  },
  silva_healing_mirror: {
    silva_healing_mirror_current_state: require('../../assets/audio/voice/silva_healing_mirror/silva_healing_mirror_current_state.mp3'),
    silva_healing_mirror_deepening: require('../../assets/audio/voice/silva_healing_mirror/silva_healing_mirror_deepening.mp3'),
    silva_healing_mirror_ideal_state: require('../../assets/audio/voice/silva_healing_mirror/silva_healing_mirror_ideal_state.mp3'),
    silva_healing_mirror_induction: require('../../assets/audio/voice/silva_healing_mirror/silva_healing_mirror_induction.mp3'),
    silva_healing_mirror_integration: require('../../assets/audio/voice/silva_healing_mirror/silva_healing_mirror_integration.mp3'),
    silva_healing_mirror_mirror_concept: require('../../assets/audio/voice/silva_healing_mirror/silva_healing_mirror_mirror_concept.mp3'),
    silva_healing_mirror_preparation: require('../../assets/audio/voice/silva_healing_mirror/silva_healing_mirror_preparation.mp3'),
    silva_healing_mirror_reorientation: require('../../assets/audio/voice/silva_healing_mirror/silva_healing_mirror_reorientation.mp3'),
    silva_healing_mirror_transformation: require('../../assets/audio/voice/silva_healing_mirror/silva_healing_mirror_transformation.mp3')
  },
  silva_intuition_mastery: {
    silva_intuition_mastery_daily_integration: require('../../assets/audio/voice/silva_intuition_mastery/silva_intuition_mastery_daily_integration.mp3'),
    silva_intuition_mastery_decision_testing: require('../../assets/audio/voice/silva_intuition_mastery/silva_intuition_mastery_decision_testing.mp3'),
    silva_intuition_mastery_deepening: require('../../assets/audio/voice/silva_intuition_mastery/silva_intuition_mastery_deepening.mp3'),
    silva_intuition_mastery_induction: require('../../assets/audio/voice/silva_intuition_mastery/silva_intuition_mastery_induction.mp3'),
    silva_intuition_mastery_integration: require('../../assets/audio/voice/silva_intuition_mastery/silva_intuition_mastery_integration.mp3'),
    silva_intuition_mastery_intuition_concept: require('../../assets/audio/voice/silva_intuition_mastery/silva_intuition_mastery_intuition_concept.mp3'),
    silva_intuition_mastery_preparation: require('../../assets/audio/voice/silva_intuition_mastery/silva_intuition_mastery_preparation.mp3'),
    silva_intuition_mastery_reorientation: require('../../assets/audio/voice/silva_intuition_mastery/silva_intuition_mastery_reorientation.mp3'),
    silva_intuition_mastery_sensing_exercise: require('../../assets/audio/voice/silva_intuition_mastery/silva_intuition_mastery_sensing_exercise.mp3')
  },
  silva_laboratory: {
    silva_laboratory_counselors: require('../../assets/audio/voice/silva_laboratory/silva_laboratory_counselors.mp3'),
    silva_laboratory_deepening: require('../../assets/audio/voice/silva_laboratory/silva_laboratory_deepening.mp3'),
    silva_laboratory_entering_lab: require('../../assets/audio/voice/silva_laboratory/silva_laboratory_entering_lab.mp3'),
    silva_laboratory_exploring_lab: require('../../assets/audio/voice/silva_laboratory/silva_laboratory_exploring_lab.mp3'),
    silva_laboratory_induction: require('../../assets/audio/voice/silva_laboratory/silva_laboratory_induction.mp3'),
    silva_laboratory_integration: require('../../assets/audio/voice/silva_laboratory/silva_laboratory_integration.mp3'),
    silva_laboratory_preparation: require('../../assets/audio/voice/silva_laboratory/silva_laboratory_preparation.mp3'),
    silva_laboratory_reorientation: require('../../assets/audio/voice/silva_laboratory/silva_laboratory_reorientation.mp3')
  },
  silva_mental_screen: {
    silva_mental_screen_creating_screen: require('../../assets/audio/voice/silva_mental_screen/silva_mental_screen_creating_screen.mp3'),
    silva_mental_screen_deepening: require('../../assets/audio/voice/silva_mental_screen/silva_mental_screen_deepening.mp3'),
    silva_mental_screen_induction: require('../../assets/audio/voice/silva_mental_screen/silva_mental_screen_induction.mp3'),
    silva_mental_screen_integration: require('../../assets/audio/voice/silva_mental_screen/silva_mental_screen_integration.mp3'),
    silva_mental_screen_preparation: require('../../assets/audio/voice/silva_mental_screen/silva_mental_screen_preparation.mp3'),
    silva_mental_screen_projecting: require('../../assets/audio/voice/silva_mental_screen/silva_mental_screen_projecting.mp3'),
    silva_mental_screen_reorientation: require('../../assets/audio/voice/silva_mental_screen/silva_mental_screen_reorientation.mp3')
  },
  silva_problem_solving: {
    silva_problem_solving_choosing_best: require('../../assets/audio/voice/silva_problem_solving/silva_problem_solving_choosing_best.mp3'),
    silva_problem_solving_deepening: require('../../assets/audio/voice/silva_problem_solving/silva_problem_solving_deepening.mp3'),
    silva_problem_solving_defining: require('../../assets/audio/voice/silva_problem_solving/silva_problem_solving_defining.mp3'),
    silva_problem_solving_induction: require('../../assets/audio/voice/silva_problem_solving/silva_problem_solving_induction.mp3'),
    silva_problem_solving_integration: require('../../assets/audio/voice/silva_problem_solving/silva_problem_solving_integration.mp3'),
    silva_problem_solving_mental_review: require('../../assets/audio/voice/silva_problem_solving/silva_problem_solving_mental_review.mp3'),
    silva_problem_solving_preparation: require('../../assets/audio/voice/silva_problem_solving/silva_problem_solving_preparation.mp3'),
    silva_problem_solving_reorientation: require('../../assets/audio/voice/silva_problem_solving/silva_problem_solving_reorientation.mp3'),
    silva_problem_solving_solutions: require('../../assets/audio/voice/silva_problem_solving/silva_problem_solving_solutions.mp3')
  },
  silva_rapid_manifest: {
    silva_rapid_manifest_clarifying_intent: require('../../assets/audio/voice/silva_rapid_manifest/silva_rapid_manifest_clarifying_intent.mp3'),
    silva_rapid_manifest_deepening: require('../../assets/audio/voice/silva_rapid_manifest/silva_rapid_manifest_deepening.mp3'),
    silva_rapid_manifest_induction: require('../../assets/audio/voice/silva_rapid_manifest/silva_rapid_manifest_induction.mp3'),
    silva_rapid_manifest_manifest_concept: require('../../assets/audio/voice/silva_rapid_manifest/silva_rapid_manifest_manifest_concept.mp3'),
    silva_rapid_manifest_preparation: require('../../assets/audio/voice/silva_rapid_manifest/silva_rapid_manifest_preparation.mp3'),
    silva_rapid_manifest_releasing: require('../../assets/audio/voice/silva_rapid_manifest/silva_rapid_manifest_releasing.mp3'),
    silva_rapid_manifest_reorientation: require('../../assets/audio/voice/silva_rapid_manifest/silva_rapid_manifest_reorientation.mp3'),
    silva_rapid_manifest_vivid_projection: require('../../assets/audio/voice/silva_rapid_manifest/silva_rapid_manifest_vivid_projection.mp3')
  },
  silva_subjective_comm: {
    silva_subjective_comm_comm_concept: require('../../assets/audio/voice/silva_subjective_comm/silva_subjective_comm_comm_concept.mp3'),
    silva_subjective_comm_deepening: require('../../assets/audio/voice/silva_subjective_comm/silva_subjective_comm_deepening.mp3'),
    silva_subjective_comm_establishing: require('../../assets/audio/voice/silva_subjective_comm/silva_subjective_comm_establishing.mp3'),
    silva_subjective_comm_induction: require('../../assets/audio/voice/silva_subjective_comm/silva_subjective_comm_induction.mp3'),
    silva_subjective_comm_integration: require('../../assets/audio/voice/silva_subjective_comm/silva_subjective_comm_integration.mp3'),
    silva_subjective_comm_preparation: require('../../assets/audio/voice/silva_subjective_comm/silva_subjective_comm_preparation.mp3'),
    silva_subjective_comm_reorientation: require('../../assets/audio/voice/silva_subjective_comm/silva_subjective_comm_reorientation.mp3'),
    silva_subjective_comm_sending_message: require('../../assets/audio/voice/silva_subjective_comm/silva_subjective_comm_sending_message.mp3')
  },
  silva_subjective_points: {
    silva_subjective_points_applying_energy: require('../../assets/audio/voice/silva_subjective_points/silva_subjective_points_applying_energy.mp3'),
    silva_subjective_points_deepening: require('../../assets/audio/voice/silva_subjective_points/silva_subjective_points_deepening.mp3'),
    silva_subjective_points_healing_focus: require('../../assets/audio/voice/silva_subjective_points/silva_subjective_points_healing_focus.mp3'),
    silva_subjective_points_induction: require('../../assets/audio/voice/silva_subjective_points/silva_subjective_points_induction.mp3'),
    silva_subjective_points_integration: require('../../assets/audio/voice/silva_subjective_points/silva_subjective_points_integration.mp3'),
    silva_subjective_points_locating_points: require('../../assets/audio/voice/silva_subjective_points/silva_subjective_points_locating_points.mp3'),
    silva_subjective_points_points_concept: require('../../assets/audio/voice/silva_subjective_points/silva_subjective_points_points_concept.mp3'),
    silva_subjective_points_preparation: require('../../assets/audio/voice/silva_subjective_points/silva_subjective_points_preparation.mp3'),
    silva_subjective_points_reorientation: require('../../assets/audio/voice/silva_subjective_points/silva_subjective_points_reorientation.mp3')
  },
  silva_three_fingers: {
    silva_three_fingers_anchor_concept: require('../../assets/audio/voice/silva_three_fingers/silva_three_fingers_anchor_concept.mp3'),
    silva_three_fingers_deepening: require('../../assets/audio/voice/silva_three_fingers/silva_three_fingers_deepening.mp3'),
    silva_three_fingers_induction: require('../../assets/audio/voice/silva_three_fingers/silva_three_fingers_induction.mp3'),
    silva_three_fingers_installing_anchor: require('../../assets/audio/voice/silva_three_fingers/silva_three_fingers_installing_anchor.mp3'),
    silva_three_fingers_integration: require('../../assets/audio/voice/silva_three_fingers/silva_three_fingers_integration.mp3'),
    silva_three_fingers_preparation: require('../../assets/audio/voice/silva_three_fingers/silva_three_fingers_preparation.mp3'),
    silva_three_fingers_reorientation: require('../../assets/audio/voice/silva_three_fingers/silva_three_fingers_reorientation.mp3'),
    silva_three_fingers_testing_anchor: require('../../assets/audio/voice/silva_three_fingers/silva_three_fingers_testing_anchor.mp3')
  },
  trans_archer_butterfly: {
    trans_archer_butterfly_archer_principle: require('../../assets/audio/voice/trans_archer_butterfly/trans_archer_butterfly_archer_principle.mp3'),
    trans_archer_butterfly_butterfly_principle: require('../../assets/audio/voice/trans_archer_butterfly/trans_archer_butterfly_butterfly_principle.mp3'),
    trans_archer_butterfly_deepening: require('../../assets/audio/voice/trans_archer_butterfly/trans_archer_butterfly_deepening.mp3'),
    trans_archer_butterfly_induction: require('../../assets/audio/voice/trans_archer_butterfly/trans_archer_butterfly_induction.mp3'),
    trans_archer_butterfly_integration: require('../../assets/audio/voice/trans_archer_butterfly/trans_archer_butterfly_integration.mp3'),
    trans_archer_butterfly_preparation: require('../../assets/audio/voice/trans_archer_butterfly/trans_archer_butterfly_preparation.mp3'),
    trans_archer_butterfly_reorientation: require('../../assets/audio/voice/trans_archer_butterfly/trans_archer_butterfly_reorientation.mp3')
  },
  trans_attention_control: {
    trans_attention_control_deepening: require('../../assets/audio/voice/trans_attention_control/trans_attention_control_deepening.mp3'),
    trans_attention_control_focus_exercise: require('../../assets/audio/voice/trans_attention_control/trans_attention_control_focus_exercise.mp3'),
    trans_attention_control_induction: require('../../assets/audio/voice/trans_attention_control/trans_attention_control_induction.mp3'),
    trans_attention_control_integration: require('../../assets/audio/voice/trans_attention_control/trans_attention_control_integration.mp3'),
    trans_attention_control_preparation: require('../../assets/audio/voice/trans_attention_control/trans_attention_control_preparation.mp3'),
    trans_attention_control_reorientation: require('../../assets/audio/voice/trans_attention_control/trans_attention_control_reorientation.mp3'),
    trans_attention_control_target_line: require('../../assets/audio/voice/trans_attention_control/trans_attention_control_target_line.mp3')
  },
  trans_create_intention: {
    trans_create_intention_anchoring: require('../../assets/audio/voice/trans_create_intention/trans_create_intention_anchoring.mp3'),
    trans_create_intention_deepening: require('../../assets/audio/voice/trans_create_intention/trans_create_intention_deepening.mp3'),
    trans_create_intention_desire_vs_intention: require('../../assets/audio/voice/trans_create_intention/trans_create_intention_desire_vs_intention.mp3'),
    trans_create_intention_forming_intention: require('../../assets/audio/voice/trans_create_intention/trans_create_intention_forming_intention.mp3'),
    trans_create_intention_induction: require('../../assets/audio/voice/trans_create_intention/trans_create_intention_induction.mp3'),
    trans_create_intention_integration: require('../../assets/audio/voice/trans_create_intention/trans_create_intention_integration.mp3'),
    trans_create_intention_preparation: require('../../assets/audio/voice/trans_create_intention/trans_create_intention_preparation.mp3'),
    trans_create_intention_reorientation: require('../../assets/audio/voice/trans_create_intention/trans_create_intention_reorientation.mp3')
  },
  trans_goal_constellation: {
    trans_goal_constellation_connecting_lines: require('../../assets/audio/voice/trans_goal_constellation/trans_goal_constellation_connecting_lines.mp3'),
    trans_goal_constellation_deepening: require('../../assets/audio/voice/trans_goal_constellation/trans_goal_constellation_deepening.mp3'),
    trans_goal_constellation_harmonizing: require('../../assets/audio/voice/trans_goal_constellation/trans_goal_constellation_harmonizing.mp3'),
    trans_goal_constellation_induction: require('../../assets/audio/voice/trans_goal_constellation/trans_goal_constellation_induction.mp3'),
    trans_goal_constellation_integration: require('../../assets/audio/voice/trans_goal_constellation/trans_goal_constellation_integration.mp3'),
    trans_goal_constellation_placing_stars: require('../../assets/audio/voice/trans_goal_constellation/trans_goal_constellation_placing_stars.mp3'),
    trans_goal_constellation_preparation: require('../../assets/audio/voice/trans_goal_constellation/trans_goal_constellation_preparation.mp3'),
    trans_goal_constellation_reorientation: require('../../assets/audio/voice/trans_goal_constellation/trans_goal_constellation_reorientation.mp3'),
    trans_goal_constellation_sky_concept: require('../../assets/audio/voice/trans_goal_constellation/trans_goal_constellation_sky_concept.mp3')
  },
  trans_lower_importance: {
    trans_lower_importance_concept: require('../../assets/audio/voice/trans_lower_importance/trans_lower_importance_concept.mp3'),
    trans_lower_importance_deepening: require('../../assets/audio/voice/trans_lower_importance/trans_lower_importance_deepening.mp3'),
    trans_lower_importance_induction: require('../../assets/audio/voice/trans_lower_importance/trans_lower_importance_induction.mp3'),
    trans_lower_importance_integration: require('../../assets/audio/voice/trans_lower_importance/trans_lower_importance_integration.mp3'),
    trans_lower_importance_preparation: require('../../assets/audio/voice/trans_lower_importance/trans_lower_importance_preparation.mp3'),
    trans_lower_importance_reorientation: require('../../assets/audio/voice/trans_lower_importance/trans_lower_importance_reorientation.mp3'),
    trans_lower_importance_visualization: require('../../assets/audio/voice/trans_lower_importance/trans_lower_importance_visualization.mp3')
  },
  trans_outer_intention: {
    trans_outer_intention_application: require('../../assets/audio/voice/trans_outer_intention/trans_outer_intention_application.mp3'),
    trans_outer_intention_deepening: require('../../assets/audio/voice/trans_outer_intention/trans_outer_intention_deepening.mp3'),
    trans_outer_intention_feeling_outer: require('../../assets/audio/voice/trans_outer_intention/trans_outer_intention_feeling_outer.mp3'),
    trans_outer_intention_induction: require('../../assets/audio/voice/trans_outer_intention/trans_outer_intention_induction.mp3'),
    trans_outer_intention_inner_vs_outer: require('../../assets/audio/voice/trans_outer_intention/trans_outer_intention_inner_vs_outer.mp3'),
    trans_outer_intention_integration: require('../../assets/audio/voice/trans_outer_intention/trans_outer_intention_integration.mp3'),
    trans_outer_intention_preparation: require('../../assets/audio/voice/trans_outer_intention/trans_outer_intention_preparation.mp3'),
    trans_outer_intention_reorientation: require('../../assets/audio/voice/trans_outer_intention/trans_outer_intention_reorientation.mp3')
  },
  trans_past_branches: {
    trans_past_branches_branch_concept: require('../../assets/audio/voice/trans_past_branches/trans_past_branches_branch_concept.mp3'),
    trans_past_branches_deepening: require('../../assets/audio/voice/trans_past_branches/trans_past_branches_deepening.mp3'),
    trans_past_branches_induction: require('../../assets/audio/voice/trans_past_branches/trans_past_branches_induction.mp3'),
    trans_past_branches_integration: require('../../assets/audio/voice/trans_past_branches/trans_past_branches_integration.mp3'),
    trans_past_branches_preparation: require('../../assets/audio/voice/trans_past_branches/trans_past_branches_preparation.mp3'),
    trans_past_branches_reorientation: require('../../assets/audio/voice/trans_past_branches/trans_past_branches_reorientation.mp3'),
    trans_past_branches_return: require('../../assets/audio/voice/trans_past_branches/trans_past_branches_return.mp3'),
    trans_past_branches_rewriting: require('../../assets/audio/voice/trans_past_branches/trans_past_branches_rewriting.mp3'),
    trans_past_branches_selecting_moment: require('../../assets/audio/voice/trans_past_branches/trans_past_branches_selecting_moment.mp3')
  },
  trans_pendulums: {
    trans_pendulums_deepening: require('../../assets/audio/voice/trans_pendulums/trans_pendulums_deepening.mp3'),
    trans_pendulums_identification: require('../../assets/audio/voice/trans_pendulums/trans_pendulums_identification.mp3'),
    trans_pendulums_induction: require('../../assets/audio/voice/trans_pendulums/trans_pendulums_induction.mp3'),
    trans_pendulums_integration: require('../../assets/audio/voice/trans_pendulums/trans_pendulums_integration.mp3'),
    trans_pendulums_pendulum_concept: require('../../assets/audio/voice/trans_pendulums/trans_pendulums_pendulum_concept.mp3'),
    trans_pendulums_preparation: require('../../assets/audio/voice/trans_pendulums/trans_pendulums_preparation.mp3'),
    trans_pendulums_release: require('../../assets/audio/voice/trans_pendulums/trans_pendulums_release.mp3'),
    trans_pendulums_reorientation: require('../../assets/audio/voice/trans_pendulums/trans_pendulums_reorientation.mp3'),
    trans_pendulums_stepping_aside: require('../../assets/audio/voice/trans_pendulums/trans_pendulums_stepping_aside.mp3')
  },
  trans_reality_mirror: {
    trans_reality_mirror_deepening: require('../../assets/audio/voice/trans_reality_mirror/trans_reality_mirror_deepening.mp3'),
    trans_reality_mirror_induction: require('../../assets/audio/voice/trans_reality_mirror/trans_reality_mirror_induction.mp3'),
    trans_reality_mirror_integration: require('../../assets/audio/voice/trans_reality_mirror/trans_reality_mirror_integration.mp3'),
    trans_reality_mirror_mirror_concept: require('../../assets/audio/voice/trans_reality_mirror/trans_reality_mirror_mirror_concept.mp3'),
    trans_reality_mirror_observation: require('../../assets/audio/voice/trans_reality_mirror/trans_reality_mirror_observation.mp3'),
    trans_reality_mirror_preparation: require('../../assets/audio/voice/trans_reality_mirror/trans_reality_mirror_preparation.mp3'),
    trans_reality_mirror_reflection: require('../../assets/audio/voice/trans_reality_mirror/trans_reality_mirror_reflection.mp3'),
    trans_reality_mirror_reorientation: require('../../assets/audio/voice/trans_reality_mirror/trans_reality_mirror_reorientation.mp3')
  },
  trans_soul_mind_unity: {
    trans_soul_mind_unity_deepening: require('../../assets/audio/voice/trans_soul_mind_unity/trans_soul_mind_unity_deepening.mp3'),
    trans_soul_mind_unity_induction: require('../../assets/audio/voice/trans_soul_mind_unity/trans_soul_mind_unity_induction.mp3'),
    trans_soul_mind_unity_integration: require('../../assets/audio/voice/trans_soul_mind_unity/trans_soul_mind_unity_integration.mp3'),
    trans_soul_mind_unity_merging: require('../../assets/audio/voice/trans_soul_mind_unity/trans_soul_mind_unity_merging.mp3'),
    trans_soul_mind_unity_mind_layer: require('../../assets/audio/voice/trans_soul_mind_unity/trans_soul_mind_unity_mind_layer.mp3'),
    trans_soul_mind_unity_preparation: require('../../assets/audio/voice/trans_soul_mind_unity/trans_soul_mind_unity_preparation.mp3'),
    trans_soul_mind_unity_reorientation: require('../../assets/audio/voice/trans_soul_mind_unity/trans_soul_mind_unity_reorientation.mp3'),
    trans_soul_mind_unity_soul_layer: require('../../assets/audio/voice/trans_soul_mind_unity/trans_soul_mind_unity_soul_layer.mp3'),
    trans_soul_mind_unity_unity_concept: require('../../assets/audio/voice/trans_soul_mind_unity/trans_soul_mind_unity_unity_concept.mp3')
  },
  trans_variant_space: {
    trans_variant_space_choosing: require('../../assets/audio/voice/trans_variant_space/trans_variant_space_choosing.mp3'),
    trans_variant_space_deepening: require('../../assets/audio/voice/trans_variant_space/trans_variant_space_deepening.mp3'),
    trans_variant_space_exploration: require('../../assets/audio/voice/trans_variant_space/trans_variant_space_exploration.mp3'),
    trans_variant_space_induction: require('../../assets/audio/voice/trans_variant_space/trans_variant_space_induction.mp3'),
    trans_variant_space_integration: require('../../assets/audio/voice/trans_variant_space/trans_variant_space_integration.mp3'),
    trans_variant_space_preparation: require('../../assets/audio/voice/trans_variant_space/trans_variant_space_preparation.mp3'),
    trans_variant_space_reorientation: require('../../assets/audio/voice/trans_variant_space/trans_variant_space_reorientation.mp3'),
    trans_variant_space_space_concept: require('../../assets/audio/voice/trans_variant_space/trans_variant_space_space_concept.mp3')
  },
  trans_wanderer_path: {
    trans_wanderer_path_deepening: require('../../assets/audio/voice/trans_wanderer_path/trans_wanderer_path_deepening.mp3'),
    trans_wanderer_path_encounters: require('../../assets/audio/voice/trans_wanderer_path/trans_wanderer_path_encounters.mp3'),
    trans_wanderer_path_induction: require('../../assets/audio/voice/trans_wanderer_path/trans_wanderer_path_induction.mp3'),
    trans_wanderer_path_integration: require('../../assets/audio/voice/trans_wanderer_path/trans_wanderer_path_integration.mp3'),
    trans_wanderer_path_preparation: require('../../assets/audio/voice/trans_wanderer_path/trans_wanderer_path_preparation.mp3'),
    trans_wanderer_path_reorientation: require('../../assets/audio/voice/trans_wanderer_path/trans_wanderer_path_reorientation.mp3'),
    trans_wanderer_path_walking_meditation: require('../../assets/audio/voice/trans_wanderer_path/trans_wanderer_path_walking_meditation.mp3'),
    trans_wanderer_path_wanderer_concept: require('../../assets/audio/voice/trans_wanderer_path/trans_wanderer_path_wanderer_concept.mp3')
  },
  trans_wave_dampener: {
    trans_wave_dampener_deepening: require('../../assets/audio/voice/trans_wave_dampener/trans_wave_dampener_deepening.mp3'),
    trans_wave_dampener_induction: require('../../assets/audio/voice/trans_wave_dampener/trans_wave_dampener_induction.mp3'),
    trans_wave_dampener_integration: require('../../assets/audio/voice/trans_wave_dampener/trans_wave_dampener_integration.mp3'),
    trans_wave_dampener_preparation: require('../../assets/audio/voice/trans_wave_dampener/trans_wave_dampener_preparation.mp3'),
    trans_wave_dampener_reorientation: require('../../assets/audio/voice/trans_wave_dampener/trans_wave_dampener_reorientation.mp3'),
    trans_wave_dampener_scanning: require('../../assets/audio/voice/trans_wave_dampener/trans_wave_dampener_scanning.mp3'),
    trans_wave_dampener_smoothing: require('../../assets/audio/voice/trans_wave_dampener/trans_wave_dampener_smoothing.mp3'),
    trans_wave_dampener_wave_concept: require('../../assets/audio/voice/trans_wave_dampener/trans_wave_dampener_wave_concept.mp3')
  },
  trans_world_slide: {
    trans_world_slide_deepening: require('../../assets/audio/voice/trans_world_slide/trans_world_slide_deepening.mp3'),
    trans_world_slide_entering_slide: require('../../assets/audio/voice/trans_world_slide/trans_world_slide_entering_slide.mp3'),
    trans_world_slide_induction: require('../../assets/audio/voice/trans_world_slide/trans_world_slide_induction.mp3'),
    trans_world_slide_living_slide: require('../../assets/audio/voice/trans_world_slide/trans_world_slide_living_slide.mp3'),
    trans_world_slide_preparation: require('../../assets/audio/voice/trans_world_slide/trans_world_slide_preparation.mp3'),
    trans_world_slide_reorientation: require('../../assets/audio/voice/trans_world_slide/trans_world_slide_reorientation.mp3'),
    trans_world_slide_return: require('../../assets/audio/voice/trans_world_slide/trans_world_slide_return.mp3'),
    trans_world_slide_slide_concept: require('../../assets/audio/voice/trans_world_slide/trans_world_slide_slide_concept.mp3')
  }
};

export default voiceModules;
