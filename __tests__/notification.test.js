const { getFormattedPhoneNumber } = require('../srcs/bot/utils');

describe('Testing utilities for parsing phone numbers', () => {
  it('Should properly format 123456789', async () => {
    const phoneNumber = getFormattedPhoneNumber('123456789');
    expect(phoneNumber).toBe('+60123456789');
  });

  it('Should properly format 0123456789', async () => {
    const phoneNumber = getFormattedPhoneNumber('0123456789');
    expect(phoneNumber).toBe('+60123456789');
  });

  it('Should properly format 60123456789', async () => {
    const phoneNumber = getFormattedPhoneNumber('60123456789');
    expect(phoneNumber).toBe('+60123456789');
  });

  it('Should properly format +60123456789', async () => {
    const phoneNumber = getFormattedPhoneNumber('+60123456789');
    expect(phoneNumber).toBe('+60123456789');
  });

  it('Should properly format 012-3456789', async () => {
    const phoneNumber = getFormattedPhoneNumber('012-3456789');
    expect(phoneNumber).toBe('+60123456789');
  });

  it('Should properly format 012-345 6789', async () => {
    const phoneNumber = getFormattedPhoneNumber('012-345 6789');
    expect(phoneNumber).toBe('+60123456789');
  });

  it('Should properly format 012345 6789', async () => {
    const phoneNumber = getFormattedPhoneNumber('012345 6789');
    expect(phoneNumber).toBe('+60123456789');
  });
});
