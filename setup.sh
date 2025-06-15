echo "🚀 Configurando Bookmark Manager..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se .env.local existe
if [ ! -f .env.local ]; then
    echo "⚠️  Criando arquivo .env.local..."
    cat > .env.local << EOL
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bookmark_manager"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Google OAuth (opcional - configure se necessário)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
EOL
    echo "✅ Arquivo .env.local criado! Configure suas variáveis de ambiente."
else
    echo "✅ Arquivo .env.local já existe."
fi

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

echo "🎉 Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure suas variáveis de ambiente no arquivo .env.local"
echo "2. Execute: npx prisma db push"
echo "3. Execute: npm run db:seed"
echo "4. Execute: npm run dev"
