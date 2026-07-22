/**
 * BELLA EOS PLATFORM CONTRACT: Platform Versioning Contract (IVersion v1.0)
 * Specification: v18.1 BELLA EOS CONSTITUTION
 * 
 * Manages SemVer compatibility policies across contracts and assets.
 */

export interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
  tag?: string;
}

export interface IVersion {
  versionString: string;
  isCompatible(consumerVersion: string, providerVersion: string): boolean;
  parse(versionString: string): VersionInfo;
}
