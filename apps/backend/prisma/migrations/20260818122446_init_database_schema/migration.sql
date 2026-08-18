-- CreateEnum
CREATE TYPE "public"."ConsentPurpose" AS ENUM ('WARDROBE', 'PERSONALIZATION', 'TRYON', 'ANALYTICS');

-- CreateEnum
CREATE TYPE "public"."ConsentStatus" AS ENUM ('GRANTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "public"."PresentationStyle" AS ENUM ('MASCULINE', 'FEMININE', 'ANDROGYNOUS', 'MIXED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."WardrobeCategory" AS ENUM ('TOP', 'BOTTOM', 'LAYER', 'DRESS', 'FOOTWEAR', 'BELT', 'BAG', 'TIE_SCARF', 'JEWELRY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."WardrobeStatus" AS ENUM ('ACTIVE', 'LAUNDRY', 'TAILORING', 'PACKED', 'LENT', 'ARCHIVED', 'DONATED');

-- CreateEnum
CREATE TYPE "public"."CalibrationMode" AS ENUM ('QUICK', 'CONFIRMED', 'REFERENCE_CARD', 'MANUAL', 'MULTI_PHOTO');

-- CreateEnum
CREATE TYPE "public"."OccasionType" AS ENUM ('CLIENT_MEETING', 'BOARD_MEETING', 'INTERVIEW', 'PRESENTATION', 'NETWORKING', 'BUSINESS_DINNER', 'CONFERENCE', 'OFFICE_DAY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."OutfitStrategy" AS ENUM ('SAFE', 'BALANCED', 'DISTINCTIVE');

-- CreateEnum
CREATE TYPE "public"."SavedLookStatus" AS ENUM ('SAVED', 'SCHEDULED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."TryOnStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."FeedbackTargetType" AS ENUM ('OUTFIT', 'TRYON_RESULT', 'RECOMMENDATION');

-- CreateEnum
CREATE TYPE "public"."BillingStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('VISION_COLOR', 'FLATLAY', 'VTO', 'RETENTION_EXPORT', 'ANALYTICS_OUTBOX');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'DEAD_LETTERED');

-- CreateEnum
CREATE TYPE "public"."MediaAssetType" AS ENUM ('WARDROBE_RAW', 'WARDROBE_CORRECTED', 'WARDROBE_CUTOUT', 'TRYON_SOURCE', 'TRYON_RESULT');

-- CreateEnum
CREATE TYPE "public"."ModerationStatus" AS ENUM ('PENDING', 'PASSED', 'FLAGGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."ImageProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."AuthProvider" AS ENUM ('OIDC', 'EMAIL_PASSWORD', 'GOOGLE', 'APPLE');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT,
    "is_adult_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."auth_identities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "public"."AuthProvider" NOT NULL,
    "provider_subject_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "purpose" "public"."ConsentPurpose" NOT NULL,
    "status" "public"."ConsentStatus" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."style_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "presentation_style" "public"."PresentationStyle" NOT NULL,
    "industries" TEXT[],
    "formality_default" TEXT,
    "fit_preferences" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "style_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."body_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "height_cm" INTEGER,
    "build_descriptor" TEXT,
    "undertone" TEXT,
    "source" TEXT NOT NULL,
    "user_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "body_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."media_assets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "asset_type" "public"."MediaAssetType" NOT NULL,
    "object_key" TEXT NOT NULL,
    "hash" TEXT,
    "device_metadata" JSONB,
    "retention_class" TEXT,
    "moderation_status" "public"."ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wardrobe_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "public"."WardrobeCategory" NOT NULL,
    "subtype" TEXT,
    "name" TEXT,
    "status" "public"."WardrobeStatus" NOT NULL DEFAULT 'ACTIVE',
    "attributes" JSONB,
    "wear_count" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wardrobe_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."item_images" (
    "id" TEXT NOT NULL,
    "wardrobe_item_id" TEXT NOT NULL,
    "raw_asset_id" TEXT NOT NULL,
    "corrected_asset_id" TEXT,
    "cutout_asset_id" TEXT,
    "processing_status" "public"."ImageProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."color_profiles" (
    "id" TEXT NOT NULL,
    "wardrobe_item_id" TEXT NOT NULL,
    "dominant_lab" JSONB NOT NULL,
    "secondary_lab" JSONB,
    "semantic_family" TEXT NOT NULL,
    "semantic_shade" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "calibration_mode" "public"."CalibrationMode" NOT NULL,
    "user_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "color_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."item_embeddings" (
    "id" TEXT NOT NULL,
    "wardrobe_item_id" TEXT NOT NULL,
    "model_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."occasions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "public"."OccasionType" NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "audience" TEXT,
    "industry" TEXT,
    "impression_primary" TEXT,
    "impression_secondary" TEXT,
    "required_item_ids" TEXT[],
    "excluded_item_ids" TEXT[],
    "constraints" JSONB,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "occasions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."outfits" (
    "id" TEXT NOT NULL,
    "occasion_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "strategy_label" "public"."OutfitStrategy" NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL,
    "score_breakdown" JSONB,
    "explanation" JSONB,
    "ruleset_version" TEXT NOT NULL,
    "model_version" TEXT NOT NULL,
    "color_engine_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outfits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."outfit_items" (
    "id" TEXT NOT NULL,
    "outfit_id" TEXT NOT NULL,
    "wardrobe_item_id" TEXT NOT NULL,
    "item_version_snapshot" JSONB NOT NULL,
    "slot" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "outfit_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."saved_looks" (
    "id" TEXT NOT NULL,
    "outfit_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "status" "public"."SavedLookStatus" NOT NULL DEFAULT 'SAVED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_looks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wear_events" (
    "id" TEXT NOT NULL,
    "saved_look_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "worn_at" DATE NOT NULL,
    "audience_key" TEXT,
    "rating" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wear_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tryon_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "outfit_id" TEXT NOT NULL,
    "source_asset_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "public"."TryOnStatus" NOT NULL DEFAULT 'PENDING',
    "idempotency_key" TEXT NOT NULL,
    "consent_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tryon_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tryon_results" (
    "id" TEXT NOT NULL,
    "tryon_request_id" TEXT NOT NULL,
    "result_asset_id" TEXT,
    "quality_gate_results" JSONB NOT NULL,
    "billed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tryon_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feedback" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_type" "public"."FeedbackTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "billing_status" "public"."BillingStatus" NOT NULL DEFAULT 'ACTIVE',
    "provider" TEXT NOT NULL,
    "provider_subscription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quota_ledger" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reference_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quota_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."processing_jobs" (
    "id" TEXT NOT NULL,
    "job_type" "public"."JobType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "started_at" TIMESTAMP(3),
    "timeout_at" TIMESTAMP(3),
    "correlation_id" TEXT NOT NULL,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processing_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."outbox_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "schema_version" TEXT NOT NULL,
    "correlation_id" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_events" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "object_type" TEXT NOT NULL,
    "object_id" TEXT NOT NULL,
    "metadata" JSONB,
    "correlation_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "auth_identities_user_id_idx" ON "public"."auth_identities"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_identities_provider_provider_subject_id_key" ON "public"."auth_identities"("provider", "provider_subject_id");

-- CreateIndex
CREATE INDEX "consents_user_id_purpose_created_at_idx" ON "public"."consents"("user_id", "purpose", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "style_profiles_user_id_key" ON "public"."style_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "body_profiles_user_id_key" ON "public"."body_profiles"("user_id");

-- CreateIndex
CREATE INDEX "media_assets_user_id_asset_type_idx" ON "public"."media_assets"("user_id", "asset_type");

-- CreateIndex
CREATE INDEX "wardrobe_items_user_id_status_idx" ON "public"."wardrobe_items"("user_id", "status");

-- CreateIndex
CREATE INDEX "color_profiles_wardrobe_item_id_is_current_idx" ON "public"."color_profiles"("wardrobe_item_id", "is_current");

-- CreateIndex
CREATE UNIQUE INDEX "item_embeddings_wardrobe_item_id_key" ON "public"."item_embeddings"("wardrobe_item_id");

-- CreateIndex
CREATE INDEX "occasions_user_id_archived_at_idx" ON "public"."occasions"("user_id", "archived_at");

-- CreateIndex
CREATE UNIQUE INDEX "tryon_requests_idempotency_key_key" ON "public"."tryon_requests"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "tryon_results_tryon_request_id_key" ON "public"."tryon_results"("tryon_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "public"."subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "processing_jobs_idempotency_key_key" ON "public"."processing_jobs"("idempotency_key");

-- CreateIndex
CREATE INDEX "processing_jobs_status_timeout_at_idx" ON "public"."processing_jobs"("status", "timeout_at");

-- CreateIndex
CREATE INDEX "outbox_events_published_at_idx" ON "public"."outbox_events"("published_at");

-- CreateIndex
CREATE INDEX "outbox_events_correlation_id_idx" ON "public"."outbox_events"("correlation_id");

-- AddForeignKey
ALTER TABLE "public"."auth_identities" ADD CONSTRAINT "auth_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consents" ADD CONSTRAINT "consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."style_profiles" ADD CONSTRAINT "style_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."body_profiles" ADD CONSTRAINT "body_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."media_assets" ADD CONSTRAINT "media_assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wardrobe_items" ADD CONSTRAINT "wardrobe_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_images" ADD CONSTRAINT "item_images_wardrobe_item_id_fkey" FOREIGN KEY ("wardrobe_item_id") REFERENCES "public"."wardrobe_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_images" ADD CONSTRAINT "item_images_raw_asset_id_fkey" FOREIGN KEY ("raw_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_images" ADD CONSTRAINT "item_images_corrected_asset_id_fkey" FOREIGN KEY ("corrected_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_images" ADD CONSTRAINT "item_images_cutout_asset_id_fkey" FOREIGN KEY ("cutout_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."color_profiles" ADD CONSTRAINT "color_profiles_wardrobe_item_id_fkey" FOREIGN KEY ("wardrobe_item_id") REFERENCES "public"."wardrobe_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_embeddings" ADD CONSTRAINT "item_embeddings_wardrobe_item_id_fkey" FOREIGN KEY ("wardrobe_item_id") REFERENCES "public"."wardrobe_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."occasions" ADD CONSTRAINT "occasions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."outfits" ADD CONSTRAINT "outfits_occasion_id_fkey" FOREIGN KEY ("occasion_id") REFERENCES "public"."occasions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."outfits" ADD CONSTRAINT "outfits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."outfit_items" ADD CONSTRAINT "outfit_items_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "public"."outfits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."outfit_items" ADD CONSTRAINT "outfit_items_wardrobe_item_id_fkey" FOREIGN KEY ("wardrobe_item_id") REFERENCES "public"."wardrobe_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."saved_looks" ADD CONSTRAINT "saved_looks_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "public"."outfits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."saved_looks" ADD CONSTRAINT "saved_looks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wear_events" ADD CONSTRAINT "wear_events_saved_look_id_fkey" FOREIGN KEY ("saved_look_id") REFERENCES "public"."saved_looks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wear_events" ADD CONSTRAINT "wear_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tryon_requests" ADD CONSTRAINT "tryon_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tryon_requests" ADD CONSTRAINT "tryon_requests_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "public"."outfits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tryon_requests" ADD CONSTRAINT "tryon_requests_source_asset_id_fkey" FOREIGN KEY ("source_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tryon_requests" ADD CONSTRAINT "tryon_requests_consent_id_fkey" FOREIGN KEY ("consent_id") REFERENCES "public"."consents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tryon_results" ADD CONSTRAINT "tryon_results_tryon_request_id_fkey" FOREIGN KEY ("tryon_request_id") REFERENCES "public"."tryon_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tryon_results" ADD CONSTRAINT "tryon_results_result_asset_id_fkey" FOREIGN KEY ("result_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feedback" ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quota_ledger" ADD CONSTRAINT "quota_ledger_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_events" ADD CONSTRAINT "audit_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
