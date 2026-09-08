import { assertMongoUriForRuntime } from './assert-mongo-uri';

describe('assertMongoUriForRuntime', () => {
  it('skips checks outside Vercel', () => {
    expect(() =>
      assertMongoUriForRuntime({ MONGODB_URI: undefined }),
    ).not.toThrow();
  });

  it('requires MONGODB_URI on Vercel', () => {
    expect(() => assertMongoUriForRuntime({ VERCEL: '1' })).toThrow(
      /MONGODB_URI is required/,
    );
  });

  it('rejects localhost Mongo on Vercel', () => {
    expect(() =>
      assertMongoUriForRuntime({
        VERCEL: '1',
        MONGODB_URI: 'mongodb://localhost:27017/sost-dashboard',
      }),
    ).toThrow(/must not point to localhost/);
  });

  it('accepts Atlas URI on Vercel', () => {
    expect(() =>
      assertMongoUriForRuntime({
        VERCEL_ENV: 'production',
        MONGODB_URI:
          'mongodb+srv://user:pass@cluster0.example.mongodb.net/sost-dashboard',
      }),
    ).not.toThrow();
  });
});
