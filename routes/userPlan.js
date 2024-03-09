const Exporess = require('express');
const router = Exporess.Router();

const { createUserPlan, getPlanById,getUserPlans, getUserPlansInPlace } = require('../mysql/services/userPlanService');

router.post('/create', async (req, resp) => {
  const payload = req.body;
  if (!payload.userId) {
    return resp.status(400).send({
      message: 'userId field is required',
    });
  }
  if (!payload.planDate) {
    return resp.status(400).send({
      message: 'planDate field is required',
    });
  }

  const plan = await createUserPlan(payload);
  if (plan) {
    return resp.status(201).send({
      data: plan,
    });
  } else {
    return resp.status(500).send({
      message: 'error creating plan',
    });
  }
});

router.get('/:planId/details', async (req, resp) => {
    const {planId} = req.params;
    if(!planId){
        return resp.status(400).send({
          message: 'plan Id not found',
        });
    }
    const plan = await getPlanById(planId);
    if(!plan){
        return resp.status(200).send({
          data: {},
        });

    }
    return resp.status(200).send({
        data: plan
    })

})

router.get('/:userId/user-plans', async (req, resp) => {
    const { userId } = req.params; 
    if(!userId){
        return resp.status(400).send({
            message: "user Id not found"
        })
    }

    const plans = await getUserPlans(Number(userId));
    return resp.status(200).send({
        data:plans
    })
})

router.get('/user/:userId/:placeId/plans', async (req, resp) => {
    const {userId, placeId} = req.params;
    if(!userId || !placeId){
        return resp.status(400).send({
            message: "userId or placeId not found"
        })
    }

    const plans = await getUserPlansInPlace(Number(userId), placeId);
    return resp.status(200).send({
      data: plans,
    });
})



module.exports = router;
