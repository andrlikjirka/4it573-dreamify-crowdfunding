import express, {raw} from "express";
import {User} from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get('/register', (req, res) => {
   res.render('users/register.html', {});
});

router.post('/register', async (req, res) => {
   const password = req.body.password;
   const passwordConfirmation = req.body.password_confirm;
   if (password !== passwordConfirmation) {
      //TODO: flashmessage??? "Chybné potvrzené hesla"
      return res.redirect('back');
   }
   try {
      const hash = await bcrypt.hash(password, 10);
      const user = new User({
         name: req.body.name,
         email: req.body.email,
         hash: hash
      });
      await user.save();
      console.log('User registered');
      const token = jwt.sign({userId: user._id, role: user.role}, process.env.JWT_SECRET_KEY, {expiresIn: '1h'});
      console.log('User authenticated' + user._id);
      res.cookie('jwt', token);
      //TODO: flashmessage??? "Login successful"
      res.redirect('/');
   } catch (err) {
      //TODO: flashmessage??? "Registration failed"
      console.error(err.message);
      res.redirect('back');
   }
});

router.get('/login', (req, res) => {
   res.render('users/login.html', {});
});

router.post('/login', async (req, res) => {
   const email = req.body.email;
   const password = req.body.password;
   try {
      const user = await User.findOne({email: email}, {}, {})
      if (!user) {
         //TODO: flashmessage??? "Authentication failed"
         return res.redirect('back');
      }
      const hashMatch = await bcrypt.compare(password, user.hash);
      if (!hashMatch) {
         //TODO: flashmessage??? "Authentication failed"
         return res.redirect('back');
      }
      const token = jwt.sign({userId: user._id, role: user.role}, process.env.JWT_SECRET_KEY, {expiresIn: '1h'});
      res.cookie('jwt', token);
      //TODO: flashmessage??? "Login successful"
      res.redirect('/');

   } catch (err) {
      //TODO: flashmessage??? "Login failed"
      console.error(err.message);
      res.redirect('back');
   }
});

router.get('/logout', (req, res) => {
   res.clearCookie('jwt');
   res.redirect('/');
});

export default router;