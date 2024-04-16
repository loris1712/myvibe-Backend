const Sequelize = require('sequelize')
const sequelize = require('../index').sequelize;
const UserPlan = require('../models/UserPlan');

const OPS = Sequelize.Op;
async function createUserPlan(payload) {
  try {
    const plan = await UserPlan.create({
      user_id: payload.userId,
      privacy: payload.privacy ?? 'private',
      name: payload.name,
      plan_date: payload.planDate,
      music: payload.music,
      dresscode: payload.dresscode,
      description: payload.description,
      capacity: payload.capacity ?? 1,
      is_completed:false,
      cover_url:payload.imageURL,
      links: payload.links ?? {},
      stops: payload.stops ?? [],
    });

    return plan;
  } catch (createPlanError) {
    console.log({ createPlanError });
    return null;
  }
}

async function updateUserPlan(payload) {
  try {
    const plan = await UserPlan.findByPk(payload.plan_id);
    if (!plan) {
      throw new Error('Plan not found');
    }

    plan.privacy = payload.privacy ?? plan.privacy;
    plan.name = payload.name ?? plan.name;
    plan.plan_date = payload.planDate ?? plan.plan_date;
    plan.music = payload.music ?? plan.music;
    plan.dresscode = payload.dresscode ?? plan.dresscode;
    plan.description = payload.description ?? plan.description;
    plan.capacity = payload.capacity ?? plan.capacity;
    plan.is_completed = payload.isCompleted ?? plan.is_completed;
    plan.cover_url = payload.imageURL ?? plan.cover_url;
    plan.links = payload.links ?? plan.links;
    plan.stops = payload.stops ?? plan.stops;

    await plan.save();

    return plan;
  } catch (updatePlanError) {
    console.log({ updatePlanError });
    return null;
  }
}

async function getPlanById(planId){
    try {
      const plan = await UserPlan.findOne({
        where: {
          id: Number(planId),
        },
      });
      return plan;
    } catch (e) {
      return null;
    }
}

async function getUserPlans(userId){
    try{
        const userPlans = await UserPlan.findAll({
            where:{
                user_id:Number(userId)
            }
        });
        return userPlans;
    }catch(e){
        return null
    }
};

async function getUserPlansInPlace(userId, placeId){
    try{
        const plans = await UserPlan.findAll({
          where: {
            user_id: Number(userId),
            stops: {
              [OPS.like]: `%${placeId}%`,
            },
          },
        });
        return plans
    }catch(e){
        return []
    }
}

async function deleteUserPlan(userId, planId){
    try{
        await UserPlan.destroy({
          where: {
            user_id: Number(userId),
            id: Number(planId),
          },
        });
        return true;
    }catch(e){
        return false
    }
}

module.exports = {
  createUserPlan,
  updateUserPlan,
  getUserPlans,
  getPlanById,
  getUserPlansInPlace,
  deleteUserPlan,
};
