"""PRD Controller - Business logic for Product Requirements Document generation"""
from fastapi import HTTPException
from controllers.gemini import ask_gemini
from models.prd import SystemPRD, EditPRDRequest, PRDWithFlowRequest, PRDWithFlowResponse
from models.usage import UsageMetrics
from utils.prompt_loader import load_prompt
from utils.markdown_utils import extract_markdown_from_response
from string import Template
import logging

logger = logging.getLogger(__name__)


async def generate_prd_with_flow(request: PRDWithFlowRequest) -> tuple[PRDWithFlowResponse, UsageMetrics]:
    """Generate combined PRD and Flow diagram"""
    logger.info(f"Starting combined PRD + Flow generation: project_name='{request.project_name}'")
    try:
        # Generate PRD
        prd_content, prd_usage = await build_prd(
            overview=request.overview,
            project_name=request.project_name,
            author=request.author,
            date=request.date,
            version=request.version
        )

        # Convert features to string format for flow diagram
        features_str = format_features_for_prompt(request.features)
        
        # Generate Flow Diagram
        flow_content, flow_usage = await build_flow(features=features_str)

        # Combine usage metrics - sum the tokens
        combined_usage = UsageMetrics(
            input_tokens=prd_usage.input_tokens + flow_usage.input_tokens,
            output_tokens=prd_usage.output_tokens + flow_usage.output_tokens,
            cost=0.0
        )

        # Combination
        combined_content = f"# PRD Document\n\n{prd_content}\n\n# Flow Diagram\n\n{flow_content}"
        logger.info(f"Combined content created successfully (total: {len(combined_content)} chars)")
        logger.info(f"Combined usage - Input: {combined_usage.input_tokens}, Output: {combined_usage.output_tokens}")

    except HTTPException as e:
        logger.error(f"HTTP error during combined PRD + Flow generation: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during combined PRD + Flow generation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info(f"Combined PRD + Flow generation completed successfully")
    return {"combined_file": combined_content}, combined_usage


def format_features_for_prompt(features) -> str:
    """Convert features list to formatted string for prompt"""
    if isinstance(features, str):
        return features
    
    if isinstance(features, list):
        formatted_features = []
        for i, feature in enumerate(features, 1):
            if isinstance(feature, dict):
                name = feature.get('name', 'Unknown Feature')
                description = feature.get('description', 'No description')
                formatted_features.append(f"{i}. **{name}**: {description}")
            else:
                # It's a Feature model object
                formatted_features.append(f"{i}. **{feature.name}**: {feature.description}")
        return "\n\n".join(formatted_features)
    
    return str(features)


async def build_prd(overview: str, project_name: str, author: str, date: str, version: str) -> tuple[str, UsageMetrics]:
    """Build PRD content"""
    logger.info("Building PRD...")
    template = load_prompt("PRD-Generate.txt")
    prompt = template.format(
        overview=overview,
        project_name=project_name,
        author=author,
        date=date,
        version=version
    )
    try:
        logger.info("Calling Gemini API for PRD build...")
        response, usage = await ask_gemini(prompt)
    except HTTPException as e:
        logger.error(f"HTTP error during PRD build: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during PRD build: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during PRD build")

    # Clean response: prefer extracted markdown, otherwise keep raw response
    cleaned = extract_markdown_from_response(response) or response
    logger.info(f"PRD content built successfully ({len(cleaned)} chars)")
    return cleaned, usage


async def build_flow(features: str) -> tuple[str, UsageMetrics]:
    """Build flow diagram content"""
    logger.info("Building flow diagram...")
    template = load_prompt("FlowDiagram-Generate.txt")
    template = Template(template)
    prompt = template.substitute(features=features)

    try:
        logger.info("Calling Gemini API for flow diagram build...")
        response, usage = await ask_gemini(prompt)
        
    except HTTPException as e:
        logger.error(f"HTTP error during flow diagram build: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during flow diagram build: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during flow diagram build")

    # Process escaped newlines
    processed_response = response.replace("\\n", "\n").replace("//n", "\n")
    
    logger.info(f"Flow diagram built successfully ({len(processed_response)} chars)")
    return processed_response, usage


async def edit_prd(request: EditPRDRequest) -> tuple[str, UsageMetrics]:
    """Edit existing PRD based on engineer notes"""
    logger.info(f"Starting PRD edit (PRD: {len(request.system_PRD)} chars, notes: {len(request.engineer_notes)} chars)")

    # Validate input
    if not request.system_PRD.strip():
        logger.warning("PRD edit rejected: empty PRD")
        raise HTTPException(status_code=400, detail="PRD cannot be empty")
    if not request.engineer_notes.strip():
        logger.warning("PRD edit rejected: empty engineer notes")
        raise HTTPException(status_code=400, detail="Engineer notes cannot be empty")

    # Construct prompt with PRD and engineer notes
    template = load_prompt("PRD-Edit.txt")
    prompt = template.format(
        system_PRD=request.system_PRD,
        engineer_notes=request.engineer_notes
    )

    try:
        logger.info("Calling Gemini API for edit...")
        revised_response, usage = await ask_gemini(prompt)
    except HTTPException as e:
        logger.error(f"HTTP error during PRD edit: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during PRD edit: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    cleaned = extract_markdown_from_response(revised_response) or revised_response
    logger.info(f"PRD edited successfully (response: {len(cleaned)} chars)")
    return cleaned, usage


async def sync_prd(request: PRDWithFlowRequest, previous_prd: str) -> tuple[PRDWithFlowResponse, UsageMetrics]:
    """Synchronize PRD with current modules and features"""
    logger.info(f"Starting PRD sync: project_name='{request.project_name}'")
    try:
        # Format modules and features hierarchically
        modules_features_text = ""
        if hasattr(request, 'features') and isinstance(request.features, dict):
            features_data = request.features.get('features', [])
            
            # Group features by module
            modules_dict = {}
            for feature in features_data:
                module_info = feature.get('module', {})
                module_name = module_info.get('name', 'Unknown Module')
                
                if module_name not in modules_dict:
                    modules_dict[module_name] = {
                        'description': module_info.get('description', 'N/A'),
                        'metrics': module_info.get('metrics', 'N/A'),
                        'features': []
                    }
                
                modules_dict[module_name]['features'].append(feature)
            
            # Format as text
            module_sections = []
            for module_name, module_data in modules_dict.items():
                module_section = f"### Module: {module_name}\n"
                module_section += f"**Description:** {module_data['description']}\n"
                if module_data['metrics']:
                    module_section += f"**Metrics:** {module_data['metrics']}\n"
                module_section += "\n**Features:**\n"
                
                for feature in module_data['features']:
                    module_section += f"- **{feature.get('name')}** (Priority: {feature.get('priority', 'medium')})\n"
                    if feature.get('description'):
                        module_section += f"  - Description: {feature.get('description')}\n"
                    if feature.get('acceptance_criteria'):
                        module_section += f"  - Acceptance Criteria: {feature.get('acceptance_criteria')}\n"
                
                module_sections.append(module_section)
            
            modules_features_text = "\n\n".join(module_sections)

        # Generate Synced PRD
        prd_content, prd_usage = await build_synced_prd(
            overview=request.overview,
            project_name=request.project_name,
            author=request.author,
            date=request.date,
            version=request.version,
            previous_prd=previous_prd,
            modules_features=modules_features_text
        )

        # Convert features to string format for flow diagram
        features_str = format_features_for_prompt(request.features)
        
        # Generate Flow Diagram (same as before)
        flow_content, flow_usage = await build_flow(features=features_str)

        # Combine usage metrics
        combined_usage = UsageMetrics(
            input_tokens=prd_usage.input_tokens + flow_usage.input_tokens,
            output_tokens=prd_usage.output_tokens + flow_usage.output_tokens,
            cost=0.0
        )

        # Combination
        combined_content = f"# PRD Document\n\n{prd_content}\n\n# Flow Diagram\n\n{flow_content}"
        logger.info(f"PRD sync completed successfully (total: {len(combined_content)} chars)")

    except HTTPException as e:
        logger.error(f"HTTP error during PRD sync: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during PRD sync: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info(f"PRD sync generation completed successfully")
    return {"combined_file": combined_content}, combined_usage


async def build_synced_prd(overview: str, project_name: str, author: str, date: str, version: str, previous_prd: str, modules_features: str) -> tuple[str, UsageMetrics]:
    """Build synchronized PRD content"""
    logger.info("Building synced PRD...")
    template = load_prompt("PRD-Sync.txt")
    prompt = template.format(
        overview=overview,
        project_name=project_name,
        author=author,
        date=date,
        version=version,
        previous_prd=previous_prd,
        modules_features=modules_features
    )
    try:
        logger.info("Calling Gemini API for PRD sync...")
        response, usage = await ask_gemini(prompt)
    except HTTPException as e:
        logger.error(f"HTTP error during synced PRD build: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during synced PRD build: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during synced PRD build")

    cleaned = extract_markdown_from_response(response) or response
    logger.info(f"Synced PRD content built successfully ({len(cleaned)} chars)")
    return cleaned, usage


async def sync_prd(request: PRDWithFlowRequest, previous_prd: str) -> tuple[PRDWithFlowResponse, UsageMetrics]:
    """Synchronize PRD with current modules and features"""
    logger.info(f"Starting PRD sync: project_name='{request.project_name}'")
    try:
        # Format modules and features hierarchically
        modules_features_text = ""
        if hasattr(request, 'features') and isinstance(request.features, dict):
            features_data = request.features.get('features', [])
            
            # Group features by module
            modules_dict = {}
            for feature in features_data:
                module_info = feature.get('module', {})
                module_name = module_info.get('name', 'Unknown Module')
                
                if module_name not in modules_dict:
                    modules_dict[module_name] = {
                        'description': module_info.get('description', 'N/A'),
                        'erd': module_info.get('erd', 'N/A'),
                        'features': []
                    }
                
                modules_dict[module_name]['features'].append(feature)
            
            # Format as markdown
            module_sections = []
            for module_name, module_data in modules_dict.items():
                features_list = "\n".join([
                    f"  - **{f.get('name')}** (Priority: {f.get('priority', 'Medium')})\n"
                    f"    - Summary: {f.get('summary', f.get('description', 'N/A'))}\n"
                    f"    - Acceptance Criteria: {f.get('acceptance_criteria', 'N/A')}\n"
                    f"    - User Flows: {f.get('user_flows', 'N/A')}\n"
                    f"    - Order: {f.get('order_of_implementation', 0)}"
                    for f in module_data['features']
                ])
                
                module_sections.append(
                    f"### Module: {module_name}\n"
                    f"**Description:** {module_data['description']}\n"
                    f"**Features:**\n{features_list}"
                )
            
            modules_features_text = "\n\n".join(module_sections)
            logger.info(f"Formatted {len(modules_dict)} modules with features for sync")

        # Generate Synced PRD
        prd_content, prd_usage = await build_synced_prd(
            overview=request.overview,
            project_name=request.project_name,
            author=request.author,
            date=request.date,
            version=request.version,
            previous_prd=previous_prd,
            modules_features=modules_features_text
        )

        # Generate Flow Diagram (same as before)
        flow_content, flow_usage = await build_flow(features=request.features)

        # Combine usage metrics
        combined_usage = UsageMetrics(
            input_tokens=prd_usage.input_tokens + flow_usage.input_tokens,
            output_tokens=prd_usage.output_tokens + flow_usage.output_tokens,
            cost=0.0
        )

        # Combination
        combined_content = f"# PRD Document\n\n{prd_content}\n\n# Flow Diagram\n\n{flow_content}"
        logger.info(f"PRD sync completed successfully (total: {len(combined_content)} chars)")
        logger.info(f"Sync usage - Input: {combined_usage.input_tokens}, Output: {combined_usage.output_tokens}")

    except HTTPException as e:
        logger.error(f"HTTP error during PRD sync: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during PRD sync: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

    logger.info(f"PRD sync generation completed successfully")
    return {"combined_file": combined_content}, combined_usage


async def build_synced_prd(overview: str, project_name: str, author: str, date: str, version: str, previous_prd: str, modules_features: str) -> tuple[str, UsageMetrics]:
    """Build synchronized PRD content"""
    logger.info("Building synced PRD...")
    template = load_prompt("PRD-Sync.txt")
    prompt = template.format(
        overview=overview,
        project_name=project_name,
        author=author,
        date=date,
        version=version,
        previous_prd=previous_prd,
        modules_features=modules_features
    )
    try:
        logger.info("Calling Gemini API for PRD sync...")
        response, usage = await ask_gemini(prompt)
    except HTTPException as e:
        logger.error(f"HTTP error during synced PRD build: {e.status_code} - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during synced PRD build: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during synced PRD build")

    cleaned = extract_markdown_from_response(response) or response
    logger.info(f"Synced PRD content built successfully ({len(cleaned)} chars)")
    return cleaned, usage
