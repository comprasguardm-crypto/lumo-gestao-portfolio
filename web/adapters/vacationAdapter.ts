// Adapter para os dados de férias vindos do RH Guará.
import { Vacation } from "@/types";

export function adaptVacation(raw: unknown): Vacation {
  // TODO: mapear payload real de férias.
  return raw as Vacation;
}
