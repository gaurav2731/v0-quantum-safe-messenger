# 🌐 Real-Time Chat with Friends (Real User Guide)

Aapne pucha ki **"Real Aadmi"** ko kaise add karein jo message bhej sake aur receive kar sake. Iske liye aapko 3 simple steps karne honge:

---

## 🛠️ Step 1: Backend & Database (PostgreSQL)
Abhi aapka frontend live hai, lekin real user chat ke liye aapko ek live "Database" chahiye. Hum **Supabase** (PostgreSQL) use karenge kyunki yeh MongoDB se zyada secure aur fast hai.

1. **Supabase Setup:**
   - [Supabase.com](https://supabase.com/) par account banayein.
   - Naya project create karein.
   - **Database Settings** mein ja kar apni **Connection String** copy karein (URI format).
   - Example: `postgresql://postgres:password@db.host.supabase.co:5432/postgres`

2. **Schema Setup:**
   - Supabase ke **SQL Editor** mein jayein.
   - Mere naye banaye gaye `server/schema.sql` ka sara code wahan paste karke **Run** kar dein. Isse aapki tables ban jayengi.

3. **Backend Host (Railway/Render):**
   - [Railway.app](https://railway.app/) par server deploy karein.
   - Wahan Environment Variable add karein: `DATABASE_URL` = (Jo Supabase se link mila).

---

## 🔗 Step 2: Vercel par URL Connect karein
Jab aapka backend live ho jaye (maan lijiye uska URL hai `https://my-backend.railway.app`), toh aapko Vercel setttings mein yeh changes karne honge:

1. **Vercel Dashboard** par jayein.
2. **Environment Variables** mein ye do cheezein add karein:
   - `NEXT_PUBLIC_API_URL` = `https://my-backend.railway.app`
   - `NEXT_PUBLIC_WS_URL` = `wss://my-backend.railway.app` (Notice `wss` for secure websocket)
3. **Redeploy:** Vercel par app ko ek baar phir deploy karein.

---

## 👥 Step 3: Friend ko Add karein
Ab aapka app puri duniya ke liye live hai!

1. **Invite:** Apne dost ko Vercel wala link bhejein.
2. **Register:** Dost [https://your-app.vercel.app/register](https://your-app.vercel.app/register) par ja kar apna account banaye.
3. **Search & Add:**
   - Aap apne chat sidebar mein dost ka **Username** ya **Email** search karein.
   - Us par click karein aur message bhejein.
4. **Chat Start!** 🚀
   - Ab aap dono real-time mein chat kar payenge, chahe aap kisi bhi city mein hon.

---

## 💡 Quick Tips
- **Always Online:** Server live hone ke baad aapko apna computer on rakhne ki zaroori nahi hogi.
- **Secure:** Kyunki yeh Quantum-Safe messenger hai, aapki chat puri tarah encrypted rahegi.

**Kya aap chahte hain main MongoDB Atlas setup karne mein aapki help karoon?** (Jisse messages hamesha safe rahein).
