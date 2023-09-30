import {
  APIGatewayTokenAuthorizerEvent,
  CustomAuthorizerResult,
} from "aws-lambda";
import { createLogger } from "../../helpers/logging/logging.helper";
import { JwtPayload, verify } from "jsonwebtoken";
import Axios from "axios";

const logger = createLogger("auth");

const jwksUrl = "https://dev-n15r7odg7v3e36s0.us.auth0.com/.well-known/jwks.json";

export const auth = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  try {
    console.log("Authorized successfully", event);
    const jwtToken = await verifyToken(event.authorizationToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    };
  } catch (e) {
    logger.error("Unauthorized", { error: e.message });

    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*",
          },
        ],
      },
    };
  }
};

async function verifyToken(authHeader) {
  // TODO: Implement token verification
  try {
    const token = getToken(authHeader);
    const res = await Axios.get(jwksUrl);

    const pemData = res["data"]["keys"][0]["x5c"][0];
    const cert = `-----BEGIN CERTIFICATE-----\n${pemData}\n-----END CERTIFICATE-----`;

    return verify(token, cert, { algorithms: ["RS256"] }) as JwtPayload;
  } catch (err) {
    logger.error("Authentication fail", err);
  }
}

function getToken(authHeader) {
  if (!authHeader) {
    throw new Error("Authentication header is empty!");
  };

  if (!authHeader.toLowerCase().startsWith("bearer ")){

    throw new Error("Authentication header is invalid!");
  };

  const split = authHeader.split(" ");
  const token = split[1];

  return token;
}
