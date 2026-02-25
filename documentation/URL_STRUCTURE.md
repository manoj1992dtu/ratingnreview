# RatingNReview URL Structure & SEO Priority

This document outlines the finalized URL structure for the RatingNReview project, mapped by SEO priority and implementation phase.

## Phase 3: Core Infrastructure (Current Focus)

| Priority | URL Path | SEO Value | Status | Current Alias |
|:---|:---|:---|:---|:---|
| 1 | `/companies/[slug]` | Very High | **Needs Migration** | `/employers/[companySlug]` |
| 2 | `/` | Very High | Active | `/` |
| 3 | `/companies` | High | **Pending** | - |
| 4 | `/companies/[slug]/reviews` | Very High | **Pending** | - |
| 5 | `/companies/[slug]/write-review` | Medium | **Pending** | `/review` (Global) |
| 6 | `/industries` | High | **Needs Migration** | `/categories` |
| 7 | `/industries/[slug]` | Very High | **Needs Migration** | `/categories/[slug]` |

## Phase 4: Extended Value

| Priority | URL Path | SEO Value | Status |
|:---|:---|:---|:---|
| 8 | `/companies/[slug]/salaries` | Very High | Future |
| 9 | `/companies/[slug]/interviews` | High | Future |
| 10 | `/top-companies` | Very High | Future |
| 11 | `/top-companies/[slug]` | Very High | Future |

## Phase 5: Regional & Aggregate Data

| Priority | URL Path | SEO Value | Status |
|:---|:---|:---|:---|
| 12 | `/companies/in/[city]` | Very High | Future |
| 13 | `/companies/in/[city]/[industry-slug]` | Very High | Future |
| 14 | `/reviews` | High | Future |
| 15 | `/salaries` | Very High | Future |
| 16 | `/interviews` | High | Future |

## Phase 6: User & Support

| Priority | URL Path | SEO Value | Status |
|:---|:---|:---|:---|
| 17 | `/login` | Low | Future |
| 18 | `/register` | Low | Future |
| 19 | `/forgot-password` | Low | Future |
| 20 | `/profile` | Low | Future |
| 21 | `/profile/my-reviews` | Low | Future |
| 22 | `/about` | Medium | Future |
| 23 | `/contact` | Low | Future |
| 24 | `/privacy-policy` | Low | Future |
| 25 | `/terms-of-service` | Low | Future |

---

## Migration Required for Consistency

To align with this document, the following folder renames are recommended in the `src/app` directory:

1. `app/employers/[companySlug]` -> `app/companies/[slug]`
2. `app/categories` -> `app/industries`
3. `app/categories/[slug]` -> `app/industries/[slug]`
