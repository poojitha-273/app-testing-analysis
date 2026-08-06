import initSqlJs, { Database } from "sql.js";
import path from "path";
import fs from "fs";

const dbPath = path.resolve(process.cwd(), "local.db");

let dbInstance: Database | null = null;

async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  let SQL: any;
  try {
    const wasmPath = path.resolve(process.cwd(), "node_modules/sql.js/dist/sql-wasm.wasm");
    SQL = await initSqlJs({
      locateFile: (file) => {
        if (file.endsWith(".wasm") && fs.existsSync(wasmPath)) {
          return wasmPath;
        }
        return file;
      }
    });
  } catch (err) {
    console.warn("Failed to load sql.js WASM with locateFile, falling back:", err);
    SQL = await initSqlJs();
  }

  if (fs.existsSync(dbPath)) {
    try {
      const filebuffer = fs.readFileSync(dbPath);
      dbInstance = new SQL.Database(filebuffer);
      console.log("Loaded existing SQLite database from:", dbPath);
    } catch (e) {
      console.warn("Failed to read existing local.db, creating fresh DB instance.", e);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
    console.log("Created new SQLite database instance.");
  }

  return dbInstance;
}

function saveDb() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error("Failed to persist local SQLite database file:", err);
  }
}

// Helper for running queries (INSERT, UPDATE, DELETE, CREATE TABLE)
export async function run(query: string, params: any[] = []): Promise<void> {
  const db = await getDb();
  db.run(query, params);
  saveDb();
}

// Helper for fetching all records as array of objects
export async function all<T>(query: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  const stmt = db.prepare(query);
  if (params && params.length > 0) {
    stmt.bind(params);
  }

  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return rows;
}

// Helper for fetching a single record
export async function get<T>(query: string, params: any[] = []): Promise<T | undefined> {
  const rows = await all<T>(query, params);
  return rows[0];
}

// Initialize tables
export async function initDb() {
  console.log("Initializing local SQLite database tables via WASM...");

  // 1. Create users table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT,
      email TEXT,
      bloodGroup TEXT,
      role TEXT CHECK(role IN ('donor', 'patient', 'admin')),
      latitude REAL,
      longitude REAL,
      isAvailable INTEGER,
      avatar TEXT,
      weight REAL,
      age INTEGER,
      lastDonationDays INTEGER,
      medications TEXT,
      healthIssues TEXT,
      recentTattoos INTEGER,
      points INTEGER
    )
  `);

  // 2. Create requests table
  await run(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      patientName TEXT,
      bloodGroup TEXT,
      hospitalName TEXT,
      unitsNeeded INTEGER,
      urgency TEXT CHECK(urgency IN ('CRITICAL', 'HIGH', 'MEDIUM')),
      reason TEXT,
      status TEXT CHECK(status IN ('Broadcasting', 'Matched', 'EnRoute', 'Arrived', 'Completed', 'Cancelled')),
      latitude REAL,
      longitude REAL,
      donorId TEXT,
      createdAt TEXT,
      contactPhone TEXT
    )
  `);

  // 3. Create messages table
  await run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      requestId TEXT,
      sender TEXT CHECK(sender IN ('patient', 'donor')),
      text TEXT,
      timestamp TEXT,
      FOREIGN KEY (requestId) REFERENCES requests(id) ON DELETE CASCADE
    )
  `);

  // 4. Create posts table
  await run(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      author TEXT,
      role TEXT,
      avatar TEXT,
      content TEXT,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      timeAgo TEXT,
      tag TEXT
    )
  `);

  // Seed default data if empty
  await seedDefaultData();
}

async function seedDefaultData() {
  try {
    // Seed users
    const userCount = await get<{ count: number }>("SELECT COUNT(*) as count FROM users");
    if (!userCount || userCount.count === 0) {
      console.log("Seeding default user...");
      await run(`
        INSERT INTO users (
          id, name, phone, email, bloodGroup, role, latitude, longitude, 
          isAvailable, avatar, weight, age, lastDonationDays, medications, 
          healthIssues, recentTattoos, points
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        "default_user",
        "Alex Mercer",
        "+1 (555) 304-2019",
        "alex.mercer@gmail.com",
        "O-",
        "donor",
        37.7749,
        -121.4194,
        1, // isAvailable
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        72.0,
        28,
        120,
        "",
        "",
        0, // recentTattoos
        350
      ]);
    }

    // Seed requests
    const reqCount = await get<{ count: number }>("SELECT COUNT(*) as count FROM requests");
    if (!reqCount || reqCount.count === 0) {
      console.log("Seeding default blood requests...");
      const defaultRequests = [
        {
          id: "req_1",
          patientName: "Robert Miller",
          bloodGroup: "O-",
          hospitalName: "UCSF Medical Center",
          unitsNeeded: 3,
          urgency: "CRITICAL",
          reason: "Acute post-trauma hemorrhaging from traffic accident.",
          status: "Broadcasting",
          latitude: 37.7630,
          longitude: -122.4580,
          donorId: "",
          createdAt: new Date().toISOString(),
          contactPhone: "+1 (555) 911-3040"
        },
        {
          id: "req_2",
          patientName: "Baby Angela",
          bloodGroup: "A-",
          hospitalName: "Zuckerberg San Francisco General",
          unitsNeeded: 1,
          urgency: "HIGH",
          reason: "Emergency neonatal substitute. Severe microcytic anemia.",
          status: "Broadcasting",
          latitude: 37.7560,
          longitude: -122.4040,
          donorId: "",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          contactPhone: "+1 (555) 390-1049"
        },
        {
          id: "req_3",
          patientName: "Marcus Vance",
          bloodGroup: "AB+",
          hospitalName: "Kaiser Permanente SF",
          unitsNeeded: 2,
          urgency: "MEDIUM",
          reason: "Oncology chemotherapy platelet transfusion backup protocol.",
          status: "Broadcasting",
          latitude: 37.7820,
          longitude: -122.4380,
          donorId: "",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          contactPhone: "+1 (555) 480-1209"
        }
      ];

      for (const req of defaultRequests) {
        await run(`
          INSERT INTO requests (
            id, patientName, bloodGroup, hospitalName, unitsNeeded, urgency, 
            reason, status, latitude, longitude, donorId, createdAt, contactPhone
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          req.id, req.patientName, req.bloodGroup, req.hospitalName, req.unitsNeeded, 
          req.urgency, req.reason, req.status, req.latitude, req.longitude, 
          req.donorId, req.createdAt, req.contactPhone
        ]);
        
        // Seed default chat messages for the first request
        if (req.id === "req_1") {
          const mockMsgs = [
            { id: "msg_1", sender: "donor", text: "Hello! I received your emergency broadcast code. Is the patient at UCSF ready?", timestamp: "12:02 PM" },
            { id: "msg_2", sender: "patient", text: "Yes! The nurses are preparing the exchange machine. How far are you?", timestamp: "12:03 PM" },
            { id: "msg_3", sender: "donor", text: "About 10 minutes away, active on my GPS tracker now. Hang tight!", timestamp: "12:04 PM" }
          ];
          for (const msg of mockMsgs) {
            await run(`
              INSERT INTO messages (id, requestId, sender, text, timestamp)
              VALUES (?, ?, ?, ?, ?)
            `, [msg.id, req.id, msg.sender, msg.text, msg.timestamp]);
          }
        }
      }
    }

    // Seed default community posts
    const postCount = await get<{ count: number }>("SELECT COUNT(*) as count FROM posts");
    if (!postCount || postCount.count === 0) {
      console.log("Seeding default posts...");
      const defaultPosts = [
        {
          id: "post_1",
          author: "Dr. Sarah Jenkins",
          role: "Chief Hematologist",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
          content: "Did you know O-Negative whole blood is critical during major trauma events? It's the only type that can be given safely to any patient when their blood group is unknown. Let's make sure our local banks are well-supplied this month!",
          likes: 42,
          comments: 8,
          timeAgo: "2 hours ago",
          tag: "Education"
        },
        {
          id: "post_2",
          author: "SF General Admin",
          role: "Hospital Dispatcher",
          avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
          content: "Urgent O-Negative whole blood drive has been extended until Thursday. Volunteers who donate before 6 PM can earn a double Civic Honor badge!",
          likes: 56,
          comments: 12,
          timeAgo: "4 hours ago",
          tag: "Campaign"
        }
      ];

      for (const post of defaultPosts) {
        await run(`
          INSERT INTO posts (id, author, role, avatar, content, likes, comments, timeAgo, tag)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          post.id, post.author, post.role, post.avatar, post.content, 
          post.likes, post.comments, post.timeAgo, post.tag
        ]);
      }
    }

  } catch (error) {
    console.error("Error seeding SQLite database:", error);
  }
}
