export function readPrefixedFields(form: FormData, prefix: string) {
  return Object.fromEntries(
    Array.from(form.entries())
      .filter(([name]) => name.startsWith(prefix))
      .map(([name, value]) => [name.slice(prefix.length), value]),
  );
}
