export async function getGeneratorReturnValue<T, TReturn, TNext>(
  stream: AsyncGenerator<T, TReturn, TNext>
): Promise<TReturn> {
  let result: IteratorResult<T, TReturn>;
  while (result = await stream.next())
    if (result.done)
      return result.value;

  throw new Error(`Unexpected no return value`);
}
