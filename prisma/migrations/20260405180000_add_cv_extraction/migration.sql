-- CreateTable
CREATE TABLE "cv_extractions" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "nome" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "localizacao" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "portfolio" TEXT,
    "resumoProfissional" TEXT,
    "experiencias" JSONB,
    "educacao" JSONB,
    "skills" JSONB,
    "idiomas" JSONB,
    "certificacoes" JSONB,
    "projetos" JSONB,
    "areaProfissional" TEXT,
    "senioridade" TEXT,
    "anosExperiencia" INTEGER,
    "principaisCompetencias" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cv_extractions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cv_extractions_cvId_key" ON "cv_extractions"("cvId");

-- AddForeignKey
ALTER TABLE "cv_extractions" ADD CONSTRAINT "cv_extractions_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
