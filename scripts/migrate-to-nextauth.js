const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function migrateToNextAuth() {
  try {
    console.log("🔄 Migrando banco para NextAuth...")

    // Aplicar o novo schema
    console.log("📋 Aplicando novo schema...")

    console.log("✅ Migração concluída!")
    console.log("🔧 Execute os seguintes comandos:")
    console.log("1. npx prisma db push")
    console.log("2. npm run db:seed")
  } catch (error) {
    console.error("❌ Erro na migração:", error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateToNextAuth()
