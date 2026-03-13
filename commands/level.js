/*
Creador: Shadow Flash
Bot: Sηαdοωβοτ
*/

function canLevelUp(level, exp) {
  // Fórmula: Nivel 1 = 100xp, Nivel 2 = 400xp, etc.
  const required = Math.floor(Math.pow(level + 1, 2) * 100)
  return exp >= required
}

export default async (m) => {
  const user = global.db.data.users[m.sender]
  if (!user) return

  let before = user.level
  while (canLevelUp(user.level, user.exp)) {
    user.level++
  }

  if (before < user.level) {
    // Si subió de nivel, puedes añadir un mensaje aquí o dejarlo silencioso
    console.log(`[LEVEL UP] ${m.sender} subió al nivel ${user.level}`)
  }
}
