-- CreateTable
CREATE TABLE "ModelImage" (
    "id" UUID NOT NULL,
    "modelId" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "alt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ModelImage" ADD CONSTRAINT "ModelImage_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
