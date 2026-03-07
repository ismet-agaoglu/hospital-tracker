export const formatGender = (gender: string): string => {
  const genderMap: Record<string, string> = {
    'MALE': 'Erkek',
    'FEMALE': 'Kadın',
    'OTHER': 'Diğer',
  };
  return genderMap[gender] || gender;
};

export const getDaysAdmitted = (admissionDate: string): number => {
  return Math.floor((Date.now() - new Date(admissionDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
};
