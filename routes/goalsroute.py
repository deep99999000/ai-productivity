from fastapi import APIRouter
from pydantic import BaseModel
from ai import generate_subgoals, generate_goals

router = APIRouter(prefix="/content", tags=["Content"])

# Request body for subgoal generation
class SubgoalRequest(BaseModel):
    goal_name: str

# Request body for goal generation
class GoalGenRequest(BaseModel):
    name: str


@router.post("/generate")
async def generate_subgoals_route(request: SubgoalRequest):
    """Generate subgoals for a given goal."""
    if not request.goal_name:
        return {"error": "Goal name is required."}
    
    content = generate_subgoals(
        goal_name=request.goal_name,
    )
    return {"content": content}


@router.post("/generate-goal")
async def generate_goals_route(request: GoalGenRequest):
    """Generate goals for a given prompt."""
    if not request.name:
        return {"error": "Prompt is required."}
    
    content = generate_goals(
        name=request.name,
    )
    return {"content": content}
