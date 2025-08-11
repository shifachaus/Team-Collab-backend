import bcrypt from "bcrypt";

export const hashValue = async (value: string, saltRound: number = 10) => {
  return await bcrypt.hash(value, saltRound);
};

export const comapreValue = async (value: string, hashValue: string) => {
  return bcrypt.compare(value, hashValue);
};
