import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

type MockResponse = {
  status: jest.MockedFunction<(statusCode: number) => MockResponse>;
  json: jest.MockedFunction<(body: unknown) => MockResponse>;
};

function createMockResponse(): MockResponse {
  const response = {} as MockResponse;
  response.status = jest.fn(() => response);
  response.json = jest.fn(() => response);
  return response;
}

function createMockHost(response: MockResponse): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let response: MockResponse;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    response = createMockResponse();
    host = createMockHost(response);
  });

  it('handles HttpException with string response', () => {
    const exception = new HttpException('Custom error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Custom error',
      }),
    );
  });

  it('normalizes validation error arrays', () => {
    const exception = new HttpException(
      {
        message: ['email must be valid', 'password is too short'],
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ['Email must be valid', 'Password is too short'],
      }),
    );
    const body = JSON.stringify(response.json.mock.calls[0][0]);
    expect(body).toContain('invalid data');
  });

  it('handles non-HttpException errors as 500', () => {
    const exception = new Error('Unexpected failure');

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      }),
    );
  });
});
