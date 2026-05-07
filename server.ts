import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const DATA_FILE = path.join(process.cwd(), "app_data.json");

interface AppData {
  users: any[];
  children: any[];
  measurements: any[];
  posyandus: string[];
}

const defaultData: AppData = {
  users: [
    {
      uid: 'admin-1',
      name: 'Administrator',
      username: 'admin',
      password: 'password123',
      email: 'admin@posyandu.id',
      idNumber: '1234567890',
      role: 'admin',
      status: 'active'
    }
  ],
  children: [],
  measurements: [],
  posyandus: ['Mawar 1', 'Mawar 2', 'Flamboyan 1', 'Anggrek 1', 'Teratai 2']
};

function readData(): AppData {
  if (!fs.existsSync(DATA_FILE)) {
    return defaultData;
  }
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return defaultData;
  }
}

function saveData(data: AppData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.get("/api/data", (req, res) => {
    try {
      const data = readData();
      res.json(data);
    } catch (error) {
      console.error("Error in /api/data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/users", (req, res) => {
    try {
      const data = readData();
      const newUser = req.body;
      
      if (!newUser || !newUser.uid) {
        return res.status(400).json({ error: "Invalid user data" });
      }

      // Check if user already exists by uid first
      const index = data.users.findIndex(u => u.uid === newUser.uid);
      if (index >= 0) {
        data.users[index] = { ...data.users[index], ...newUser };
      } else {
        // Check if username is taken
        const usernameExists = data.users.some(u => u.username === newUser.username);
        if (usernameExists && newUser.username !== 'admin') {
          return res.status(400).json({ error: "Username sudah digunakan" });
        }
        data.users.push(newUser);
      }
      
      saveData(data);
      res.json(newUser);
    } catch (error) {
      console.error("Error in POST /api/users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/users/update", (req, res) => {
    const data = readData();
    const { uid, updates } = req.body;
    const index = data.users.findIndex(u => u.uid === uid);
    if (index >= 0) {
      data.users[index] = { ...data.users[index], ...updates };
      saveData(data);
      res.json(data.users[index]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.delete("/api/users/:uid", (req, res) => {
    const data = readData();
    const { uid } = req.params;
    data.users = data.users.filter(u => u.uid !== uid);
    saveData(data);
    res.json({ success: true });
  });

  app.post("/api/children", (req, res) => {
    const data = readData();
    const child = req.body;
    const index = data.children.findIndex(c => c.id === child.id);
    if (index >= 0) {
      data.children[index] = child;
    } else {
      data.children.push(child);
    }
    saveData(data);
    res.json(child);
  });

  app.delete("/api/children/:id", (req, res) => {
    const data = readData();
    const { id } = req.params;
    data.children = data.children.filter(c => c.id !== id);
    // Also delete related measurements
    data.measurements = data.measurements.filter(m => m.childId !== id);
    saveData(data);
    res.json({ success: true });
  });

  app.post("/api/measurements", (req, res) => {
    const data = readData();
    const measurement = req.body;
    const index = data.measurements.findIndex(m => m.id === measurement.id);
    if (index >= 0) {
      data.measurements[index] = measurement;
    } else {
      data.measurements.push(measurement);
    }
    saveData(data);
    res.json(measurement);
  });

  app.delete("/api/measurements/:id", (req, res) => {
    const data = readData();
    const { id } = req.params;
    data.measurements = data.measurements.filter(m => m.id !== id);
    saveData(data);
    res.json({ success: true });
  });

  app.post("/api/posyandus", (req, res) => {
    const data = readData();
    data.posyandus = req.body;
    saveData(data);
    res.json(data.posyandus);
  });

  app.get("/api/reports/export", (req, res) => {
    const data = readData();
    const { startDate, endDate, posyandu } = req.query;
    
    let filteredMeasurements = data.measurements;
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);

      filteredMeasurements = data.measurements.filter(m => {
        const d = new Date(m.date);
        return d >= start && d <= end;
      });
    }

    if (posyandu) {
      filteredMeasurements = filteredMeasurements.filter(m => {
        const child = data.children.find(c => c.id === m.childId);
        return child && child.posyanduName === posyandu;
      });
    }

    // Prepare CSV header
    let csv = "\uFEFF"; // Byte Order Mark for Excel
    csv += "Nama Balita,Posyandu,Orang Tua,Tanggal Penimbangan,Usia (Bulan),Berat Badan (kg),Tinggi Badan (cm),Status Gizi\n";
    
    filteredMeasurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(m => {
      const child = data.children.find(c => c.id === m.childId);
      if (child) {
        // Calculate age in months at time of measurement
        const birth = new Date(child.birthDate);
        const measurementDate = new Date(m.date);
        const ageMonths = (measurementDate.getFullYear() - birth.getFullYear()) * 12 + (measurementDate.getMonth() - birth.getMonth());

        csv += `"${child.name}","${child.posyanduName}","${child.parentsName}","${new Date(m.date).toLocaleDateString('id-ID')}",${ageMonths},${m.weight},${m.height},"${m.stuntingStatus}"\n`;
      }
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=Laporan_Posyandu_${posyandu || 'Nasional'}_${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csv);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("CRITICAL: Failed to start server:", err);
  process.exit(1);
});
