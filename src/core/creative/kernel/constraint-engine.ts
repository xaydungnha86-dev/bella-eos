/**
 * BELLA EOS — Creative Runtime
 * kernel/constraint-engine.ts
 *
 * Resolves platform + enterprise constraints into a ConstraintSet.
 * Called ONCE before planners run — result stored in PlanningContext.constraints.
 * Planners READ constraints from context, not from this engine directly.
 *
 * applyConstraints() at end of kernel = final validation only, not enforcement.
 */

import type {
  TargetPlatform,
  EnterprisePolicy,
  ConstraintSet,
} from './planning-context';

type PlatformSpec = Partial<ConstraintSet> & {
  safeZone?: ConstraintSet['safeZone'];
};

export class ConstraintEngine {
  private static readonly PLATFORMS: Record<string, PlatformSpec> = {
    instagram_reel: {
      maxHeadlineChars: 35,
      safeZone:         { top: 15, bottom: 15, left: 5, right: 5 },
      maxPromptChars:   1800,
    },
    instagram_feed: {
      maxHeadlineChars: 40,
      safeZone:         { top: 5,  bottom: 5,  left: 5, right: 5 },
      maxPromptChars:   1800,
    },
    facebook_cover: {
      maxHeadlineChars: 60,
      safeZone:         { top: 10, bottom: 25, left: 10, right: 10 },
      maxPromptChars:   1800,
    },
    google_ads: {
      maxHeadlineChars:  30,
      maxImageTextRatio: 0.2,
      safeZone:          { top: 5,  bottom: 5,  left: 5, right: 5 },
      maxPromptChars:    1500,
    },
    youtube_thumbnail: {
      maxHeadlineChars: 40,
      safeZone:         { top: 5,  bottom: 5,  left: 5, right: 5 },
      maxPromptChars:   1800,
    },
    linkedin_post: {
      maxHeadlineChars: 70,
      safeZone:         { top: 5,  bottom: 5,  left: 5, right: 5 },
      maxPromptChars:   1800,
    },
    print_a3: {
      maxHeadlineChars: 80,
      maxPromptChars:   2000,
      safeZone:         { top: 8,  bottom: 8,  left: 8, right: 8 },
    },
    default: {
      maxHeadlineChars: 60,
      maxPromptChars:   1800,
      safeZone:         { top: 5,  bottom: 5,  left: 5, right: 5 },
    },
  };

  static resolve(platform: TargetPlatform, policy: EnterprisePolicy): ConstraintSet {
    const spec = this.PLATFORMS[platform.name] ?? this.PLATFORMS.default;
    const notes: string[] = [];

    if (policy.forbiddenColors.length > 0) {
      notes.push(`Brand policy forbids colors: ${policy.forbiddenColors.join(', ')}`);
    }
    if (spec.maxImageTextRatio) {
      notes.push(`Platform "${platform.name}" enforces max ${spec.maxImageTextRatio * 100}% image text area`);
    }
    if (policy.brandApprovedStyles?.length) {
      notes.push(`Enterprise policy restricts styles to: ${policy.brandApprovedStyles.join(', ')}`);
    }

    return {
      maxHeadlineChars:  spec.maxHeadlineChars  ?? 60,
      maxImageTextRatio: spec.maxImageTextRatio,
      forbiddenColors:   policy.forbiddenColors ?? [],
      mandatoryElements: policy.mandatoryLogo ? ['logo'] : [],
      safeZone:          spec.safeZone ?? platform.safeZone,
      allowedStyleIds:   policy.brandApprovedStyles?.length
                         ? policy.brandApprovedStyles : undefined,
      maxPromptChars:    spec.maxPromptChars ?? 1800,
      notes,
    };
  }

  /** Final validation check after all planners complete. Returns violated constraints. */
  static validate(
    plan: Partial<import('../creative-plan').CreativePlan>,
    constraints: ConstraintSet,
  ): string[] {
    const violations: string[] = [];

    if (constraints.allowedStyleIds && plan.styleId) {
      if (!constraints.allowedStyleIds.includes(plan.styleId)) {
        violations.push(`StyleId "${plan.styleId}" violates enterprise policy`);
      }
    }
    if (constraints.forbiddenColors.length > 0 && plan.palette?.accent) {
      if (constraints.forbiddenColors.includes(plan.palette.accent)) {
        violations.push(`Palette accent "${plan.palette.accent}" is a forbidden brand color`);
      }
    }
    if (plan.imagenPrompt && constraints.maxPromptChars) {
      if (plan.imagenPrompt.length > constraints.maxPromptChars) {
        violations.push(`imagenPrompt (${plan.imagenPrompt.length} chars) exceeds platform limit (${constraints.maxPromptChars})`);
      }
    }

    return violations;
  }
}
