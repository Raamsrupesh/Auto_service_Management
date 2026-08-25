export async function error_response(error, req, res, next){
    console.error('An error occurred:', error);
    return res.status(error.status_code || 500).json({
        msg: error.msg || 'Internal server error',
        function:error.function_name,
        success: false,
        extra_det:error.extra_det || ""
    });
    process.exit(1);
}