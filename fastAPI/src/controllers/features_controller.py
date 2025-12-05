"""Features Controller - Business logic for feature generation and management"""
from fastapi import HTTPException
from controllers.gemini import ask_gemini
from models.overview import RequirementsRequest
from models.features import FeatureList, FeatureDetailsRequest, FeatureDetailsResponse, SingleFeatureRequest, SingleFeatureResponse, FeatureGenerationRequest, FeatureSuggestionList, FeatureRegenerationRequest, RegeneratedFeatureList
from models.prd import SystemPRD
from models.usage import UsageMetrics
from utils.json_utils import extract_json_from_response
from utils.prompt_loader import load_prompt
from string import Template
import json
import logging

logger = logging.getLogger(__name__)


# ============================================================
# Module-Based Feature Generation Methods (New Flow)
# ============================================================

async def generate_suggestion_features_for_module(request: FeatureGenerationRequest) -> tuple[FeatureSuggestionList, UsageMetrics]:
    """Generate feature suggestions for a module based on its ERD and context"""
    logger.info(f"Starting feature suggestions for module: {request.module_context.name}")
    logger.info(f"Module has ERD: {bool(request.module_context.erd)}, Existing features count: {len(request.existing_features)}")

    # Format metrics section
    metrics_section = ""
    if request.module_context.metrics:
        metrics_section = f"**Success Metrics:** {request.module_context.metrics}"
        logger.info("Module has defined success metrics")
    else:
        logger.info("No metrics defined for module")

    # Format existing features for context
    existing_features_section = ""
    if request.existing_features:
        features_list = "\n".join([
            f"{feature.order_of_implementation}. **{feature.name}**: {feature.description or 'No description'}"
            for feature in sorted(request.existing_features, key=lambda f: f.order_of_implementation)
        ])
        existing_features_section = f"""
### Existing Features in Module:
{features_list}

**Important:** Do not suggest features that duplicate the functionality above.
"""
        logger.info(f"Including {len(request.existing_features)} existing features in context")
    else:
        logger.info("No existing features - generating first features for this module")

    # Build Prompt
    logger.info("Loading prompt template...")
    template = load_prompt("Features-Module-Generate.txt")
    template = Template(template)
    
    logger.info("Building prompt with module context...")
    prompt = template.substitute(
        module_name=request.module_context.name,
        module_description=request.module_context.description,
        metrics_section=metrics_section,
        module_erd=request.module_context.erd or "No ERD available",
        existing_features_section=existing_features_section
    )

    logger.info(f"Prompt built successfully (length: {len(prompt)} characters)")
    usage = None
    
    try:
        logger.info("Calling Gemini API for feature suggestions...")
        raw_response, usage = await ask_gemini(prompt)
        logger.info(f"Gemini API response received (length: {len(raw_response)} characters)")

        logger.info("Extracting JSON from response...")
        json_str = extract_json_from_response(raw_response)

        if not json_str:
            logger.error("No valid JSON found in Gemini response")
            raise HTTPException(status_code=500, detail="No valid JSON found in Gemini response")

        logger.info(f"JSON extracted (length: {len(json_str)} characters), parsing...")
        parsed_data = json.loads(json_str)
        feature_list = FeatureSuggestionList(**parsed_data)
        
        logger.info(f"✓ Feature suggestions generated successfully: {len(feature_list.features)} features")
        logger.info(f"Features: {[f.name for f in feature_list.features]}")
        return feature_list, usage

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Invalid JSON response from AI")
    except HTTPException as e:
        logger.error(f"HTTP error: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during feature suggestion: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


async def regenerate_suggestion_features(request: FeatureRegenerationRequest) -> tuple[RegeneratedFeatureList, UsageMetrics]:
    """Regenerate feature suggestions based on user feedback"""
    logger.info(f"Starting feature regeneration for module: {request.module_context.name}")
    logger.info(f"User feedback provided: {bool(request.user_notes)} (length: {len(request.user_notes) if request.user_notes else 0} chars)")
    logger.info(f"Previous features count: {len(request.previous_features)}, Existing features: {len(request.existing_features)}")

    # Format metrics section
    metrics_section = ""
    if request.module_context.metrics:
        metrics_section = f"**Success Metrics:** {request.module_context.metrics}"
        logger.info("Module has defined success metrics")
    else:
        logger.info("No metrics defined for module")

    # Format previous features
    previous_features_text = "\n".join([
        f"- **{feature.name}**: {feature.description}"
        for feature in request.previous_features
    ])
    logger.info(f"Formatted {len(request.previous_features)} previous features for context")

    # Format existing features
    existing_features_section = ""
    if request.existing_features:
        features_list = "\n".join([
            f"{feature.order_of_implementation}. **{feature.name}**: {feature.description or 'No description'}"
            for feature in sorted(request.existing_features, key=lambda f: f.order_of_implementation)
        ])
        existing_features_section = f"""
### Existing Features in Module:
{features_list}

**Important:** Do not suggest features that duplicate the functionality above.
"""
        logger.info(f"Including {len(request.existing_features)} existing features in context")
    else:
        logger.info("No existing features in module")

    # Build Prompt
    logger.info("Loading regeneration prompt template...")
    template = load_prompt("Features-Module-Regenerate.txt")
    template = Template(template)
    
    logger.info("Building prompt with module context and user feedback...")
    prompt = template.substitute(
        module_name=request.module_context.name,
        module_description=request.module_context.description,
        metrics_section=metrics_section,
        module_erd=request.module_context.erd or "No ERD available",
        previous_features=previous_features_text,
        user_notes=request.user_notes,
        existing_features_section=existing_features_section
    )

    logger.info(f"Prompt built successfully (length: {len(prompt)} characters)")
    usage = None
    
    try:
        logger.info("Calling Gemini API for feature regeneration...")
        raw_response, usage = await ask_gemini(prompt)
        logger.info(f"Gemini API response received (length: {len(raw_response)} characters)")

        logger.info("Extracting JSON from response...")
        json_str = extract_json_from_response(raw_response)

        if not json_str:
            logger.error("No valid JSON found in Gemini regeneration response")
            raise HTTPException(status_code=500, detail="No valid JSON found in Gemini response")

        logger.info(f"JSON extracted (length: {len(json_str)} characters), parsing...")
        parsed_data = json.loads(json_str)
        feature_list = RegeneratedFeatureList(**parsed_data)
        
        logger.info(f"✓ Features regenerated successfully: {len(feature_list.features)} features")
        logger.info(f"Regenerated features: {[f.name for f in feature_list.features]}")
        return feature_list, usage

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error during regeneration: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Invalid JSON response from AI")
    except HTTPException as e:
        logger.error(f"HTTP error during regeneration: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during regeneration: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


async def generate_feature_details(request: FeatureDetailsRequest) -> tuple[FeatureDetailsResponse, UsageMetrics]:
    """Generate detailed information for selected features (enrichment phase)"""
    logger.info(f"Starting feature details generation for module: {request.module_context.name}")
    logger.info(f"Features to enrich: {len(request.features)}, Existing features: {len(request.existing_features)}")

    # Format metrics section
    metrics_section = ""
    if request.module_context.metrics:
        metrics_section = f"**Success Metrics:** {request.module_context.metrics}"
        logger.info("Module has defined success metrics")
    else:
        logger.info("No metrics defined for module")

    # Format features for enrichment
    features_text = "\n".join([
        f"- **{feature.name}**: {feature.description}"
        for feature in request.features
    ])
    logger.info(f"Formatted {len(request.features)} features for enrichment")

    # Format existing features
    existing_features_section = ""
    if request.existing_features:
        features_list = "\n".join([
            f"{feature.order_of_implementation}. **{feature.name}**: {feature.description or 'No description'}"
            for feature in sorted(request.existing_features, key=lambda f: f.order_of_implementation)
        ])
        existing_features_section = f"""
### Existing Features in Module:
{features_list}

**Important:** Consider dependencies on features above when defining priority and order.
"""
        logger.info(f"Including {len(request.existing_features)} existing features in context")
    else:
        logger.info("No existing features - these will be the first features in module")

    # Build Prompt
    logger.info("Loading feature details prompt template...")
    template = load_prompt("Features-Module-Details.txt")
    template = Template(template)
    
    logger.info("Building prompt with module context and features...")
    prompt = template.substitute(
        module_name=request.module_context.name,
        module_description=request.module_context.description,
        metrics_section=metrics_section,
        module_erd=request.module_context.erd or "No ERD available",
        features=features_text,
        existing_features_section=existing_features_section
    )

    logger.info(f"Prompt built successfully (length: {len(prompt)} characters)")
    usage = None
    
    try:
        logger.info("Calling Gemini API for feature details...")
        raw_response, usage = await ask_gemini(prompt)
        logger.info(f"Gemini API response received (length: {len(raw_response)} characters)")

        logger.info("Extracting JSON from response...")
        json_str = extract_json_from_response(raw_response)

        if not json_str:
            logger.error("No valid JSON found in Gemini feature details response")
            raise HTTPException(status_code=500, detail="No valid JSON found in Gemini response")

        logger.info(f"JSON extracted (length: {len(json_str)} characters), parsing...")
        parsed_data = json.loads(json_str)
        
        # Normalize feature data - convert arrays to strings
        if 'features' in parsed_data:
            for feature in parsed_data['features']:
                for field in ['acceptance_criteria', 'user_flows', 'metrics']:
                    if field in feature and isinstance(feature[field], list):
                        # Join array items with newlines, adding bullet points
                        feature[field] = '\n'.join(f'• {item}' for item in feature[field])
                        logger.info(f"Normalized {field} from array to string for feature: {feature.get('name', 'unknown')}")
        
        details_response = FeatureDetailsResponse(**parsed_data)
        
        logger.info(f"✓ Feature details generated successfully: {len(details_response.features)} features enriched")
        logger.info(f"Enriched features: {[f.name for f in details_response.features]}")
        return details_response, usage

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error in feature details: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Invalid JSON response from AI")
    except HTTPException as e:
        logger.error(f"HTTP error in feature details: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in feature details: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


async def generate_single_feature(request: SingleFeatureRequest) -> tuple[SingleFeatureResponse, UsageMetrics]:
    """Generate a single enriched feature with context of existing features"""
    logger.info(f"Starting single feature generation: {request.new_feature_name}")
    logger.info(f"Module: {request.module_context.name}, Existing features: {len(request.existing_features)}")

    # Format metrics section
    metrics_section = ""
    if request.module_context.metrics:
        metrics_section = f"**Success Metrics:** {request.module_context.metrics}"
        logger.info("Module has defined success metrics")
    else:
        logger.info("No metrics defined for module")

    # Format existing features
    existing_features_section = ""
    if request.existing_features:
        features_list = "\n".join([
            f"{feature.order_of_implementation}. **{feature.name}**: {feature.description or 'No description'}"
            for feature in sorted(request.existing_features, key=lambda f: f.order_of_implementation)
        ])
        existing_features_section = f"""
### Existing Features in Module:
{features_list}

**Important:** Analyze dependencies on features above and assign appropriate priority and order.
"""
        logger.info(f"Including {len(request.existing_features)} existing features in context")
    else:
        existing_features_section = "### Existing Features in Module:\nNone - this will be the first feature in the module."
        logger.info("No existing features - this will be the first feature")

    # Build Prompt
    logger.info("Loading single feature prompt template...")
    template = load_prompt("Features-Module-Single.txt")
    template = Template(template)
    
    logger.info("Building prompt for single feature generation...")
    prompt = template.substitute(
        module_name=request.module_context.name,
        module_description=request.module_context.description,
        metrics_section=metrics_section,
        module_erd=request.module_context.erd or "No ERD available",
        new_feature_name=request.new_feature_name,
        new_feature_description=request.new_feature_description,
        existing_features_section=existing_features_section
    )

    logger.info(f"Prompt built successfully (length: {len(prompt)} characters)")
    usage = None
    
    try:
        logger.info("Calling Gemini API for single feature generation...")
        raw_response, usage = await ask_gemini(prompt)
        logger.info(f"Gemini API response received (length: {len(raw_response)} characters)")

        logger.info("Extracting JSON from response...")
        json_str = extract_json_from_response(raw_response)

        if not json_str:
            logger.error("No valid JSON found in Gemini single feature response")
            raise HTTPException(status_code=500, detail="No valid JSON found in Gemini response")

        logger.info(f"JSON extracted (length: {len(json_str)} characters), parsing...")
        parsed_data = json.loads(json_str)
        
        # Normalize feature data - convert arrays to strings
        if 'feature' in parsed_data:
            feature = parsed_data['feature']
            for field in ['acceptance_criteria', 'user_flows', 'metrics']:
                if field in feature and isinstance(feature[field], list):
                    # Join array items with newlines, adding bullet points
                    feature[field] = '\n'.join(f'• {item}' for item in feature[field])
                    logger.info(f"Normalized {field} from array to string for feature: {feature.get('name', 'unknown')}")
        
        single_response = SingleFeatureResponse(**parsed_data)
        
        logger.info(f"✓ Single feature generated successfully: {single_response.feature.name}")
        logger.info(f"Priority: {single_response.feature.priority}, Order: {single_response.feature.order_of_implementation}")
        return single_response, usage

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error in single feature: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Invalid JSON response from AI")
    except HTTPException as e:
        logger.error(f"HTTP error in single feature: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in single feature: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")



