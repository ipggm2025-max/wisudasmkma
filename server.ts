import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dzgdocqppfzdebgyqhib.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Admin client for user management
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to create/update user with password
  app.post("/api/users/save", async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase Service Role Key is not configured. Please add SUPABASE_SERVICE_ROLE_KEY to your environment variables." });
    }

    const { email, password, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required." });
    }

    try {
      // 1. Get user from Auth (to get their ID)
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) throw listError;

      let authUser = users.find(u => u.email === email);

      // 2. If password is provided, create or update user
      if (password) {
        if (authUser) {
          // Update existing user password
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            authUser.id,
            { password }
          );
          if (updateError) throw updateError;
        } else {
          // Create new user
          const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
          });
          if (createError) throw createError;
          authUser = newUser;
        }
      }

      if (!authUser) {
        return res.status(400).json({ error: "User belum terdaftar di sistem autentikasi. Silakan masukkan password untuk membuat akun baru." });
      }

      // 3. Upsert the role in the public.users table with the ID from Auth
      const { error: dbError } = await supabaseAdmin
        .from('users')
        .upsert({ 
          id: authUser.id, // Use the UUID from Auth
          email, 
          role 
        }, { onConflict: 'email' });

      if (dbError) throw dbError;

      res.json({ success: true });
    } catch (error: any) {
      console.error("Save user error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
