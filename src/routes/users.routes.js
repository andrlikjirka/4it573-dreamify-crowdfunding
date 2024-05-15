import express, {raw} from "express";
import {User} from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get('/users/register', (req, res) => {
   res.render('users/register.html', {});
});

router.post('/users/register', async (req, res) => {
   const password = req.body.password;
   const passwordConfirmation = req.body.password_confirm;
   if (password !== passwordConfirmation) {
      //TODO: flashmessage??? "Chybné potvrzené hesla"
      res.redirect('back');
   }
   const hash = await bcrypt.hash(password, 10);
   try {
      const user = new User({
         name: req.body.name,
         email: req.body.email,
         hash: hash
      });
      await user.save();
      console.log('User registered');
      const token = jwt.sign({userId: user._id, role: user.role}, process.env.JWT_SECRET_KEY, {expiresIn: '1h'});
      console.log('User authenticated' + user.toJSON());
      res.cookie('jwt', token);
      //TODO: flashmessage??? "Login successful"
      res.redirect('/');
   } catch (err) {
      //TODO: flashmessage??? "Registration failed"
      console.error(err.message);
      res.redirect('back');
   }
});

router.get('/users/login', (req, res) => {
   res.render('users/login.html', {});
});

router.post('/users/login', async (req, res) => {
   const email = req.body.email;
   const password = req.body.password;
   try {
      const user = await User.findOne({email: email}, {}, {})
      if (!user) {
         res.status(401);
         //TODO: flashmessage??? "Authentication failed"
         res.render('back');
      }
      const hashMatch = await bcrypt.compare(password, user.hash);
      if (!hashMatch) {
         //TODO: flashmessage??? "Authentication failed"
         res.redirect('back');
      }
      const token = jwt.sign({userId: user._id, role: user.role}, process.env.JWT_SECRET_KEY, {expiresIn: '1h'});
      console.log('User authenticated:' + user)
      res.cookie('jwt', token);
      //TODO: flashmessage??? "Login successful"
      res.redirect('/');
   } catch (err) {
      //TODO: flashmessage??? "Login failed"
      console.error(err.message);
      res.redirect('back');
   }
});

router.get('/users/logout', (req, res) => {
   res.clearCookie('jwt');
   res.redirect('back');
});

export default router;