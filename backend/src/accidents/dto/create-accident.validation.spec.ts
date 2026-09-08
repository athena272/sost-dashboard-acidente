import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AccidentStatus, AccidentType } from '@sost/shared';
import { CreateAccidentDto } from './create-accident.dto';

describe('ValidationPipe + CreateAccidentDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  async function validate(body: unknown) {
    return pipe.transform(body, {
      type: 'body',
      metatype: CreateAccidentDto,
    });
  }

  it('rejects empty create payload', async () => {
    await expect(validate({})).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects create without victimName', async () => {
    await expect(
      validate({
        company: 'EBSERH',
        accidentDate: '2024-03-10',
        emissionYear: 2024,
        accidentType: AccidentType.Typical,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  /**
   * Regression: the new-form UI used to POST only defaults (company, year,
   * type, status) with no victim/date — and the API accepted it.
   */
  it('rejects historical empty-form defaults-only payload', async () => {
    await expect(
      validate({
        company: 'EBSERH',
        emissionYear: new Date().getFullYear(),
        accidentType: AccidentType.Typical,
        status: AccidentStatus.Unknown,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects create without accidentDate', async () => {
    await expect(
      validate({
        company: 'EBSERH',
        victimName: 'Maria Silva',
        emissionYear: 2024,
        accidentType: AccidentType.Typical,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects create without accidentType', async () => {
    await expect(
      validate({
        company: 'EBSERH',
        victimName: 'Maria Silva',
        accidentDate: '2024-03-10',
        emissionYear: 2024,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts minimal valid create payload', async () => {
    const result = await validate({
      company: 'EBSERH',
      victimName: 'Maria Silva',
      accidentDate: '2024-03-10',
      emissionYear: 2024,
      accidentType: AccidentType.Typical,
    });
    expect(result).toMatchObject({
      company: 'EBSERH',
      victimName: 'Maria Silva',
      accidentType: AccidentType.Typical,
      emissionYear: 2024,
    });
  });
});
