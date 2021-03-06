const router = require('express').Router();
const controller = require('./usersController.js');

router.get('/:username', async (req, res) => {
  try {
    let data = await controller.getUserInfoByName(req.params);
    res.send(data);
  } catch (err) {
    res.sendStatus(500);
  }
});

router.get('/id/:id', async (req, res) => {
  try {
    let data = await controller.getUserInfoById(req.params);
    res.send(data);
  } catch (err) {
    res.sendStatus(500);
  }
});

router.route('/')
  .put(async (req, res) => {
    try {
      let data = await controller.updateUser(req.body);
      res.send(data);
    } catch (err) {
      res.sendStatus(500);
    }
  });

module.exports = router;
