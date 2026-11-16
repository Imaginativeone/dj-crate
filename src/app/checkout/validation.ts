export type OrderFields = { name: string; email: string; event: string };
export type OrderErrors = Partial<Record<keyof OrderFields | "crate", string>>;

/** Shared, pure validation. Runs on the server; easy to unit test. */
export function validateOrder(fields: OrderFields, songCount: number): OrderErrors {
  const errors: OrderErrors = {};
  if (fields.name.trim().length < 2) errors.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = "Enter an email address like name@example.com.";
  }
  if (songCount === 0) errors.crate = "Your crate is empty.";
  return errors;
}
