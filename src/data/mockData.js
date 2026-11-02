export const initialPlayers = [
  {
    id: "P001",
    name: "Rahul Kumar",
    email: "rahul@gmail.com",
    phone: "9876543210",
    age: 24,
    role: "Batsman",
    battingStyle: "Right Hand",
    bowlingStyle: "Right Arm Fast",
    matches: 25,
    runs: 650,
    wickets: 3
  },
  {
    id: "P002",
    name: "Kiran Reddy",
    email: "kiran@gmail.com",
    phone: "9876543211",
    age: 23,
    role: "All Rounder",
    battingStyle: "Right Hand",
    bowlingStyle: "Right Arm Medium",
    matches: 30,
    runs: 450,
    wickets: 22
  },
  {
    id: "P003",
    name: "Suresh",
    email: "suresh@gmail.com",
    phone: "9876543212",
    age: 25,
    role: "Bowler",
    battingStyle: "Left Hand",
    bowlingStyle: "Left Arm Fast",
    matches: 20,
    runs: 120,
    wickets: 35
  },
  {
    id: "P004",
    name: "Arjun",
    email: "arjun@gmail.com",
    phone: "9876543213",
    age: 22,
    role: "Wicket Keeper",
    battingStyle: "Right Hand",
    bowlingStyle: "None",
    matches: 18,
    runs: 380,
    wickets: 0
  }
];

export const initialTeams = [
  {
    id: "T001",
    name: "Hyderabad Kings",
    shortName: "HK",
    location: "Hyderabad",
    captainId: "P001",
    playerIds: ["P001", "P002", "P003"],
    color: "#15803d",
    createdAt: new Date().toISOString()
  },
  {
    id: "T002",
    name: "Street Warriors",
    shortName: "SW",
    location: "Madhapur",
    captainId: "P002",
    playerIds: ["P002", "P004"],
    color: "#2563eb",
    createdAt: new Date().toISOString()
  }
];