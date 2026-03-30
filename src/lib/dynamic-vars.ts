export function parseDynamicVariables(text: string, context: { client_name?: string, financial_year?: string } = {}): string {
  if (!text) return '';

  const now = new Date();
  
  const variables: Record<string, string> = {
    '[CURRENT_YEAR]': now.getFullYear().toString(),
    '[LAST_YEAR]': (now.getFullYear() - 1).toString(),
    '[NEXT_YEAR]': (now.getFullYear() + 1).toString(),
    '[CURRENT_MONTH_NAME]': now.toLocaleString('default', { month: 'long' }),
    '[LAST_MONTH_NAME]': new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString('default', { month: 'long' }),
    '[CLIENT_NAME]': context.client_name || 'Valued Client',
    '[FINANCIAL_YEAR]': context.financial_year || now.getFullYear().toString(),
  };

  let parsedText = text;
  
  // Replace all available variables
  Object.keys(variables).forEach(key => {
    // Escape brackets for regex
    const regex = new RegExp(key.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g');
    parsedText = parsedText.replace(regex, variables[key]);
  });

  return parsedText;
}
