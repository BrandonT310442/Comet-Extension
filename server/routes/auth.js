import express from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

// Check if environment variables are defined
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// JWT Secret for session tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  sameSite: 'lax',
  path: '/'
};

// Middleware to check if user is authenticated
const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Get current user
router.get('/user', async (req, res) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(200).json({ user: null });
  }
  
  try {
    const user = jwt.verify(token, JWT_SECRET);
    
    // Get fresh user data from Supabase
    const { data, error } = await supabase.auth.getUser(user.access_token);
    
    if (error || !data.user) {
      res.clearCookie('auth_token');
      return res.status(200).json({ user: null });
    }
    
    return res.status(200).json({ 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || '',
      } 
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.clearCookie('auth_token');
    return res.status(200).json({ user: null });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Supabase login error:', error);
      return res.status(401).json({ error: error.message });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: data.user.id,
        email: data.user.email,
        access_token: data.session.access_token
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set JWT in cookie
    res.cookie('auth_token', token, COOKIE_OPTIONS);
    
    return res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || '',
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Signup
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email`
      }
    });
    
    if (error) {
      console.error('Supabase signup error:', error);
      return res.status(400).json({ error: error.message });
    }
    
    // If email confirmation is required
    if (data.user && !data.session) {
      return res.status(200).json({ 
        message: 'Please check your email to confirm your registration',
        requiresEmailConfirmation: true
      });
    }
    
    // If auto-confirmed (no email confirmation required)
    if (data.user && data.session) {
      // Create JWT token
      const token = jwt.sign(
        { 
          id: data.user.id,
          email: data.user.email,
          access_token: data.session.access_token
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Set JWT in cookie
      res.cookie('auth_token', token, COOKIE_OPTIONS);
      
      return res.status(200).json({
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || '',
        }
      });
    }
    
    return res.status(200).json({ message: 'Account created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'An error occurred during signup' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  return res.status(200).json({ message: 'Logged out successfully' });
});

// OAuth callback handler
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect('/?error=callback_error');
  }
  
  try {
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error || !data?.session) {
      console.error('OAuth callback error:', error);
      return res.redirect('/?error=callback_error');
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: data.user.id,
        email: data.user.email,
        access_token: data.session.access_token
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set JWT in cookie
    res.cookie('auth_token', token, COOKIE_OPTIONS);
    
    // Redirect to dashboard
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('OAuth callback processing error:', error);
    return res.redirect('/?error=callback_error');
  }
});

// Handle client-side OAuth flow
router.post('/oauth-callback', async (req, res) => {
  const { access_token, refresh_token, user } = req.body;
  
  if (!access_token || !user) {
    return res.status(400).json({ error: 'Missing required OAuth data' });
  }
  
  try {
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(access_token);
    
    if (error || !data.user) {
      console.error('Invalid OAuth token:', error);
      return res.status(401).json({ error: 'Invalid OAuth token' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: data.user.id,
        email: data.user.email,
        access_token: access_token
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set JWT in cookie
    res.cookie('auth_token', token, COOKIE_OPTIONS);
    
    return res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || '',
      }
    });
  } catch (error) {
    console.error('OAuth client-side processing error:', error);
    return res.status(500).json({ error: 'Failed to process OAuth authentication' });
  }
});

// Get user data endpoint
router.get('/user-data', authenticateToken, async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(req.user.access_token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Failed to get user data' });
    }
    
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;