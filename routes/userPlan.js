const Exporess = require('express');
const router = Exporess.Router();
const sgMail = require('@sendgrid/mail')
const pool = require('../mysql/index').pool;

try {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} catch (e) {
  console.log(e);
}

const { createUserPlan, updateUserPlan, getPlanById, getUserPlans, getUserPlansInPlace, deleteUserPlan } = require('../mysql/services/userPlanService');

async function sendEmail(to, from, subject, templateId, dynamicData) {
  const msg = {
    to,
    from,
    subject,
    templateId,
    dynamic_template_data: dynamicData,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
    return true; 
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

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
    
    const msg = {
      to: payload.owner_email,
      from: 'dev@myvibe.is',
      subject: 'Your plan has been created on myvibe',
      text: 'Thank you for creating your plan with us. We are pleased to inform you that your plan has been successfully created.',
      html: '<p>Thank you for creating your plan with us. We are pleased to inform you that your plan has been successfully created.</p>',
    }
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })

    return resp.status(201).send({
      data: plan,
    });
  } else {
    return resp.status(500).send({
      message: 'error creating plan',
    });
  }
});

router.post('/update', async (req, resp) => {
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

  const plan = await updateUserPlan(payload);
  if (plan) {
    
    const msg = {
      to: payload.owner_email,
      from: 'dev@myvibe.is',
      subject: 'Your plan has been created on myvibe',
      text: 'Thank you for creating your plan with us. We are pleased to inform you that your plan has been successfully created.',
      html: '<p>Thank you for creating your plan with us. We are pleased to inform you that your plan has been successfully created.</p>',
    }
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })

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


router.delete('/:userId/:planId', async (req, resp)=> {
        const { userId, planId } = req.params;
        if (!userId || !planId) {
          return resp.status(400).send({
            message: 'userId or planId not found',
          });
        }

        const deleted = await deleteUserPlan(userId, planId);
        if(deleted){
            return resp.status(200).send({
                data: null
            })
        }else {
            return resp.status(500).send({
              message: "Error deleting plan",
            });
        }

});

router.post('/notifyPromoter/:prom_e/:u_e', async (req, resp)=> {
  const { prom_e, u_e } = req.params;

  const msg = {
    to: prom_e,
    from: 'dev@myvibe.is',
    subject: 'New RSVP for Your Event!',
    text: 'Thank you for creating your event with us. We are pleased to inform you that a new user has just clicked on RSVP to attend your event. We look forward to welcoming them!',
    html: '<p>Thank you for creating your event with us. We are pleased to inform you that a new user has just clicked on RSVP to attend your event. We look forward to welcoming them!</p>',
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
      return resp.status(200).send({
        data: null
      })
    })
    .catch((error) => {
      console.error(error)
      return resp.status(500).send({
        message: error,
      });
    })
  
    const msg2 = {
      to: u_e,
      from: 'dev@myvibe.is',
      subject: 'New RSVP for Your Event!',
      text: 'Thank you for your RSVP to attend [Event Name]. We\'re excited to have you join us! See you at the event!',
      html: '<p>Thank you for your RSVP to attend [Event Name]. We\'re excited to have you join us! See you at the event!</p>',
    } 
    sgMail  
      .send(msg2)
      .then(() => {
        console.log('Email sent')
        return resp.status(200).send({
          data: null
        })
      })
      .catch((error) => {
        console.error(error)
        return resp.status(500).send({
          message: error,
        });
      })

});
  
router.post('/saveRSVP/:plan_id/:user_id/:prom_e/:u_e', (req, resp) => {
  const { plan_id, user_id, prom_e, u_e } = req.params;

  try {
    const checkQuery = 'SELECT * FROM event_participants WHERE user_id = ? AND id_event = ?';
    
    pool.query(checkQuery, [user_id, plan_id], (checkError, checkResults) => {
      if (checkError) {
        console.error(checkError);
        return resp.status(500).json({ error: 'An error occurred while checking the participant.' });
      }

      if (checkResults.length > 0) {
        return resp.status(200).json({ message: 'Participant already exists for this plan.' });
      } else {
        const insertQuery = 'INSERT INTO event_participants (user_id, id_event) VALUES (?, ?)';
        
        pool.query(insertQuery, [user_id, plan_id], async (insertError, insertResults) => {
          if (insertError) {
            console.error(insertError);
            return resp.status(500).json({ error: 'An error occurred. Please try again later.' });
          }

          try {
            // Recupera i dati relativi all'evento
            const eventQuery = 'SELECT name FROM user_plan WHERE id = ?';
            pool.query(eventQuery, [plan_id], (eventError, eventResults) => {
              if (eventError) {
                console.error(eventError);
                return resp.status(500).json({ error: 'An error occurred while fetching event data.' });
              }

              // Recupera il nome utente
              const userQuery = 'SELECT fullname FROM users WHERE id = ?';
              pool.query(userQuery, [user_id], (userError, userResults) => {
                if (userError) {
                  console.error(userError);
                  return resp.status(500).json({ error: 'An error occurred while fetching user data.' });
                }

                const dynamicData2 = {
                  user_email: prom_e,
                  event_name: eventResults[0].name,
                  username: userResults[0].fullname,
                };

                const dynamicData = {
                  promoter_email: prom_e,
                  user_email: prom_e,
                  username: userResults[0].fullname,
                };

                console.log(dynamicData)

                const promoterEmailSent = sendEmail(
                  prom_e,
                  'dev@myvibe.is',
                  'You Have 1 New RSVP from ' + u_e,
                  'd-f87fe2f78f47432eb9f2efe3f1914b2e',
                  dynamicData
                );

                const userEmailSent = sendEmail(
                  u_e,
                  'dev@myvibe.is',
                  'Thanks for Attending ' + u_e,
                  'd-362d4b3726f64f4886d307077d5803ce',
                  dynamicData2
                );

                return resp.status(200).json({ message: 'Invitation successfully accepted.', subtitle: 'Good fun!' });
              });
            });
          } catch (emailError) {
            console.error('Error sending email:', emailError);
            return resp.status(500).json({ error: 'An error occurred while sending emails.' });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    return resp.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
});

router.post('/getRSVPsPlan/:plan_id', async (req, resp)=> {
  const { plan_id } = req.params;

  try {
    const selectQuery = `
      SELECT u.email
      FROM event_participants ep
      INNER JOIN users u ON ep.user_id = u.id
      WHERE ep.id_event = ?;
    `;

    pool.query(selectQuery, [plan_id], (selectError, selectResults) => {
      if (selectError) {
        console.error(selectError);
        return resp.status(500).json({ error: 'An error occurred while fetching participants.' });
      } 

      const emails = selectResults.map(result => result.email);
      const emailCount = selectResults.length;
 
      console.log(emailCount)
      return resp.status(200).json({ emails: emails, emailCount: emailCount });
    });
  } catch (error) {
    console.error(error);
    return resp.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
});
 
module.exports = router;