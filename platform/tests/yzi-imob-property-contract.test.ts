import assert from "node:assert/strict";
import test from "node:test";

import {
  PROPERTY_COMMERCIAL_STAGE_VALUES,
  PROPERTY_FLOOR_DESIGNATION_VALUES,
  PROPERTY_FLOOR_PLAN_APPLICABLE_TYPES,
  PROPERTY_TYPE_VALUES,
} from "../src/lib/yzi-imob/properties/contract.ts";
import { buildPropertyPersistencePayload } from "../src/lib/yzi-imob/properties/persistence.ts";
import { validateCreateProperty } from "../src/lib/yzi-imob/properties/validation.ts";
import type { CreatePropertyInput } from "../src/lib/yzi-imob/properties/types.ts";

function input(overrides: Partial<CreatePropertyInput> = {}): CreatePropertyInput {
  return {
    title: "Aura Lofts — Jardim Oceania",
    status: "draft",
    propertyType: "loft",
    transactionType: "venda",
    availabilityStatus: "available",
    floor: 0,
    attributes: { floorDesignation: "ground" },
    commercialContext: {
      record_kind: "development",
      commercial_stage: "launch",
      price_qualifier: "starting_at",
    },
    ...overrides,
  };
}

test("contrato aceita Loft, Lançamento e Térreo nos conceitos corretos", () => {
  assert.ok(PROPERTY_TYPE_VALUES.includes("loft"));
  assert.ok(PROPERTY_COMMERCIAL_STAGE_VALUES.includes("launch"));
  assert.ok(PROPERTY_FLOOR_DESIGNATION_VALUES.includes("ground"));
  assert.ok(PROPERTY_FLOOR_PLAN_APPLICABLE_TYPES.includes("loft"));

  const result = validateCreateProperty(input());
  assert.equal(result.valid, true);
  if (!result.valid) return;
  assert.equal(result.value.propertyType, "loft");
  assert.equal(result.value.commercialContext.commercial_stage, "launch");
  assert.equal(result.value.commercialContext.record_kind, "development");
  assert.equal(result.value.floor, 0);
  assert.equal(result.value.attributes.floorDesignation, "ground");
});

test("Apartamento e valores históricos continuam válidos", () => {
  assert.equal(validateCreateProperty(input({ propertyType: "apartamento" })).valid, true);
  assert.equal(
    validateCreateProperty(input({ propertyType: "comercial", status: "em_captacao" })).valid,
    true,
  );
});

test("taxonomias inválidas são rejeitadas", () => {
  const invalidType = validateCreateProperty(input({ propertyType: "castelo" }));
  assert.equal(invalidType.valid, false);
  if (!invalidType.valid) assert.ok(invalidType.errors.includes("property_type_invalid:castelo"));

  const invalidStage = validateCreateProperty(
    input({ commercialContext: { commercial_stage: "na_planta" } }),
  );
  assert.equal(invalidStage.valid, false);

  const invalidFeature = validateCreateProperty(input({ propertyFeatures: ["item inventado"] }));
  assert.equal(invalidFeature.valid, false);
});

test("pavimentos especiais não são confundidos com número de andar", () => {
  const mezzanine = validateCreateProperty(
    input({ floor: null, attributes: { floorDesignation: "mezzanine" } }),
  );
  assert.equal(mezzanine.valid, true);

  const contradictory = validateCreateProperty(
    input({ floor: 1, attributes: { floorDesignation: "mezzanine" } }),
  );
  assert.equal(contradictory.valid, false);
  if (!contradictory.valid) {
    assert.ok(contradictory.errors.includes("floor_special_must_not_have_number"));
  }
});

test("serializer preserva contrato e recebe tenant somente da camada server", () => {
  const validated = validateCreateProperty(input({ price: 294_000 }));
  assert.equal(validated.valid, true);
  if (!validated.valid) return;

  const payload = buildPropertyPersistencePayload("tenant-a", validated.value);
  assert.equal(payload.tenant_id, "tenant-a");
  assert.equal(payload.property_type, "loft");
  assert.equal(payload.transaction_type, "venda");
  assert.equal(payload.floor, 0);
  assert.deepEqual(payload.commercial_context, {
    record_kind: "development",
    commercial_stage: "launch",
    price_qualifier: "starting_at",
  });
});
