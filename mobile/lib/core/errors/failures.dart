/// Base failure and exception handling contract
abstract class Failure {
  final String message;
  const Failure(this.message);
}

class ServerFailure extends Failure {
  const ServerFailure([super.message = 'Server Error']);
}

class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'Network Error']);
}

class AuthFailure extends Failure {
  const AuthFailure([super.message = 'Authentication Error']);
}
