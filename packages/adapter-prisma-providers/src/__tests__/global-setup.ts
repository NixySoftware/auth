export const setup = () => {
    // Ensure timezone is consistent between CI and development environments
    process.env.TZ = 'CET';
};
