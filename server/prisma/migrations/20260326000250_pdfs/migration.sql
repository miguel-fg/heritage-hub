-- CreateTable
CREATE TABLE "ModelPdfs" (
    "id" UUID NOT NULL,
    "modelId" UUID NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelPdfs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ModelPdfs" ADD CONSTRAINT "ModelPdfs_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
