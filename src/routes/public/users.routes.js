import express from "express";
import {User} from "../../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {getUserByEmail, getUserById} from "../../services/users.service.js";

const router = express.Router();

router.get('/register', (req, res) => {
   res.render('public/users/register.html', {});
});

router.post('/register', async (req, res) => {
   const password = req.body.password;
   const passwordConfirmation = req.body.password_confirm;
   if (password !== passwordConfirmation) {
      req.session.flash = {type: 'danger', message: `Zadaná hesla se neshodují.`};
      return res.redirect('back');
   }
   try {
      const hash = await bcrypt.hash(password, 10);
      const user = new User({
         name: req.body.name,
         email: req.body.email,
         paypal_address: req.body.paypal_address,
         hash: hash
      });
      await user.save();
      console.log('User registered');
      const token = jwt.sign({userId: user._id, role: user.role}, process.env.JWT_SECRET_KEY, {expiresIn: '1h'});
      console.log('User authenticated' + user._id);
      res.cookie('jwt', token);
      req.session.flash = {type: 'success', message: `Registrace a první přihlášení proběhly úspěšně.`};
      res.redirect('/');
   } catch (err) {
      req.session.flash = {type: 'danger', message: `Registrace se nezdařila.`};
      console.error(err.message);
      res.redirect('back');
   }
});

router.get('/login', (req, res) => {
   res.render('public/users/login.html', {});
});

router.post('/login', async (req, res) => {
   try {
      const user = await getUserByEmail(req.body.email, false, false);
      if (!user) {
         req.session.flash = {type: 'danger', message: `Zadané přihlašovací údaje jsou neplatné.`};
         return res.redirect('back');
      }
      const hashMatch = await bcrypt.compare(req.body.password, user.hash);
      if (!hashMatch) {
         req.session.flash = {type: 'danger', message: `Zadané přihlašovací údaje jsou neplatné.`};
         return res.redirect('back');
      }
      const token = jwt.sign({userId: user._id, role: user.role}, process.env.JWT_SECRET_KEY, {expiresIn: '1h'});
      res.cookie('jwt', token);
      //req.session.flash = {type: 'success', message: `Přihlášení proběhlo úspěšně.`};
      res.redirect('/');

   } catch (err) {
      req.session.flash = {type: 'danger', message: `Přihlášení selhalo.`};
      console.error(err.message);
      res.redirect('back');
   }
});

router.get('/logout', (req, res) => {
   res.clearCookie('jwt');
   req.session.flash = {type: 'success', message: `Odhlášení proběhlo úspěšně.`};
   res.redirect('/');
});

router.get('/profile', authMiddleware, async (req, res, next) => {
   const user = await getUserById(res.locals.userIdentity.id, false, false);
   if (!user) return next();

   res.render('public/users/profile.index.html', {
      user:  user
   });
});

router.put('/profile', authMiddleware, async (req, res, next) => {
   let user = await getUserById(res.locals.userIdentity.id, false, false);

   if (req.body.name) user.name = req.body.name;
   if (req.body.email) user.email = req.body.email;
   if (req.body.paypal_address) user.paypal_address = req.body.paypal_address;
   if (req.body.password && req.body.password_confirm) {
      if (req.body.password === req.body.password_confirm){
         console.log(req.body.password)
         user.hash = await bcrypt.hash(req.body.password, 10);
         res.clearCookie('jwt');
      } else {
         console.log('New passwords does not correspond to password confirmation. Update failed.')
         req.session.flash = {type: 'danger', message: `Zadaná hesla se neshodují.`};
         return res.redirect('back');
      }
   }

   try {
      await user.save();
      req.session.flash = {type: 'success', message: `Úprava profilu proběhla úspěšně.`};
      console.log(`Successfully updated user info: ${user._id}`);
   } catch (err) {
      console.error(err.message);
      req.session.flash = {type: 'danger', message: `Úprava profilu se nezdařila.`};
      return res.redirect('back');
   }

   res.redirect('back');
});

export default router;