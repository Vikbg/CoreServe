// generate-users.js
const fs = require("fs");

const totalUsers = 5000;
let csv = "username,password\n";

for (let i = 1; i <= totalUsers; i++) {
  csv += `user${i},Test1234.\n`;
}

fs.writeFileSync("users.csv", csv);
console.log(`✅ users.csv généré avec ${totalUsers} utilisateurs.`);