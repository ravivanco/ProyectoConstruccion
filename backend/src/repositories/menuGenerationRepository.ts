import { findNutritionPlanById } from './nutritionPlanRepository.js';
import { getPatientProfileById } from './patientProfileRepository.js';
import { listDishes } from './dishRepository.js';
import { MEAL_SLOTS, MealSlotKey } from '../types/planWeek.js';
import { Dish } from '../types/dish.js';

export interface MenuRestrictionIssue {
  dishId: string;
  dishName: string;
  reason: string;
  matchedTerm: string;
}

export interface MenuGenerationResult {
  planId: string;
  patientId: string;
  restrictionsApplied: string[];
  excludedDishes: MenuRestrictionIssue[];
  suggestions: GeneratedMealSuggestion[];
}

export interface GeneratedMealSuggestion {
  mealSlot: MealSlotKey;
  mealName: string;
  dish: Dish;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function dishConflicts(
  dish: Dish,
  restrictedTerms: string[],
): MenuRestrictionIssue | null {
  const searchable = [
    dish.name,
    dish.category,
    ...dish.tags,
    ...dish.ingredients.map((i) => i.name),
  ]
    .map(normalizeText)
    .join(' ');

  for (const term of restrictedTerms) {
    const normalized = normalizeText(term);
    if (!normalized) continue;
    if (searchable.includes(normalized)) {
      return {
        dishId: dish.id,
        dishName: dish.name,
        reason: 'Contiene alimento restringido o alérgeno',
        matchedTerm: term,
      };
    }
  }
  return null;
}

export async function generateMenusWithRestrictions(
  planId: string,
  nutritionistId: string,
): Promise<MenuGenerationResult | null> {
  const plan = await findNutritionPlanById(planId);
  if (!plan || plan.nutritionistId !== nutritionistId) return null;

  const profile = await getPatientProfileById(plan.patientId);
  const restrictionsApplied = [
    ...(profile?.allergies ?? []),
    ...(profile?.intolerances ?? []),
    ...(profile?.foodRestrictions ?? []),
  ];

  const dishes = await listDishes(nutritionistId);
  const excludedDishes: MenuRestrictionIssue[] = [];
  const allowed: Dish[] = [];

  for (const dish of dishes) {
    if (!dish.isActive) continue;
    const conflict = dishConflicts(dish, restrictionsApplied);
    if (conflict) {
      excludedDishes.push(conflict);
    } else {
      allowed.push(dish);
    }
  }

  const suggestions: GeneratedMealSuggestion[] = [];
  let dishIndex = 0;

  for (const slot of MEAL_SLOTS) {
    if (!allowed.length) break;
    const dish = allowed[dishIndex % allowed.length];
    dishIndex += 1;
    suggestions.push({
      mealSlot: slot.key,
      mealName: slot.name,
      dish,
    });
  }

  return {
    planId,
    patientId: plan.patientId,
    restrictionsApplied,
    excludedDishes,
    suggestions,
  };
}

export async function validateMenuAssignment(
  patientId: string,
  nutritionistId: string,
  dishName: string,
  ingredients: string[] = [],
): Promise<{ valid: boolean; issues: MenuRestrictionIssue[] }> {
  const profile = await getPatientProfileById(patientId);
  const restrictionsApplied = [
    ...(profile?.allergies ?? []),
    ...(profile?.intolerances ?? []),
    ...(profile?.foodRestrictions ?? []),
  ];

  const pseudoDish: Dish = {
    id: 'validation',
    name: dishName,
    category: 'Colaciones',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    ingredients: ingredients.map((name) => ({ name, quantity: '' })),
    tags: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const conflict = dishConflicts(pseudoDish, restrictionsApplied);
  if (!conflict) {
    return { valid: true, issues: [] };
  }

  return { valid: false, issues: [conflict] };
}
